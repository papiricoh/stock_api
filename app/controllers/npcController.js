const User = require('../models/db');

async function calculateEMA(data, window) {
    var multiplier = 2 / (window + 1);
    // create an array to hold the EMA values
    var emaArr = new Array(data.length);

    // Calculate the seed (the first EMA value), which is just the average of the first 'window' days
    var seed = data.slice(0, window).reduce((total, curr) => total + curr) / window;
    emaArr[window - 1] = seed;

    // Calculate EMA for the rest of the data
    for (var i = window; i < data.length; i++) {
        emaArr[i] = (data[i] - emaArr[i - 1]) * multiplier + emaArr[i - 1];
    }

    return emaArr[emaArr.length - 1];
}

async function getCompanyByLabel(label) {
    const company = await User.getCompanyData(label);
    const comp = await User.getCompanyHistory(company.id);
    const ownedShares = await User.getCompanyTotalOwnedShares(company.id);
    company.history = comp;
    if(ownedShares.totalOwnedShares == null) {
      ownedShares.totalOwnedShares = 0;
    }
    company.shares = { avariableShares: company.total_shares - ownedShares.totalOwnedShares, ownedShares: Number(ownedShares.totalOwnedShares)}
    return company;
}

exports.npcMovement = async (req, res) => {
    try {
        const all_companies_labels = await User.getAllCompaniesLabels();
        for (let index = 0; index < all_companies_labels.length; index++) {
            const company = await getCompanyByLabel(all_companies_labels[index].company_label);
            let currentShares = 0;
            try {
                currentShares = await User.getSharesFromId('NPC', company.id);
                currentShares = currentShares.quantity;
            } catch (err_shares) {
                if (err_shares.message.includes("Shares of company")) {
                    currentShares = 0;
                    await User.insertEmptyShares('NPC', company.id);
                }else {
                    throw err_shares;
                }
            }
            let quantity = Number(((company.total_shares * 0.1) * ((Math.random(200) / 100) + 0.5)).toFixed(0) );
            const canBuy = Boolean(company.shares.avariableShares - quantity >= 0);
            const canSell = Boolean(currentShares - quantity >= 0);
            console.log(canBuy, canSell);
            let emaWindow = 10;//Number of days
            if(emaWindow > company.history.length) {
                emaWindow = company.history.length;
            }
            let emaData = [];
            const actualPrice = company.history[company.history.length - 1];
            for (let index = 0; index < company.history.length - 1; index++) {
                emaData[index] = company.history[index].price;
            }
            const ema = await calculateEMA( emaData, emaWindow);
            console.log(company.company_label + " Ema: -> " + ema);

            if(canBuy && ema > actualPrice.price) { //IF EMA > actual_price -> Price down (Buy??)
                await User.updateShares("NPC", company.id, Number(currentShares + Number(quantity)));
                console.log("Can buy: " + quantity);

                let new_price = Number((actualPrice.price + (actualPrice.price * ( quantity / company.total_shares ))).toFixed(2));
                await User.insertNewHistory(company.id, new_price, actualPrice.price * quantity);
            }else if(canSell && ema < actualPrice.price) { //IF EMA < actual_price -> Price up (Sell??)
                await User.updateShares("NPC", company.id, Number(currentShares - Number(quantity)));
                console.log("Can sell: " + quantity);

                let new_price = Number((actualPrice.price - (actualPrice.price * ( quantity / company.total_shares ))).toFixed(2));
                await User.insertNewHistory(company.id, new_price, actualPrice.price * quantity);
                
            }else if(canBuy) {
                quantity = quantity - 49;
                await User.updateShares("NPC", company.id, Number(currentShares + Number(quantity)));
                console.log("Can buy alternative: " + quantity);
                let new_price = Number((actualPrice.price + (actualPrice.price * ( quantity / company.total_shares ))).toFixed(2));
                await User.insertNewHistory(company.id, new_price, actualPrice.price * quantity);
            }else if(canSell) {
                quantity = quantity - 49;
                await User.updateShares("NPC", company.id, Number(currentShares - Number(quantity)));
                console.log("Can sell alternative: " + quantity);
                let new_price = Number((actualPrice.price - (actualPrice.price * ( quantity / company.total_shares ))).toFixed(2));
                await User.insertNewHistory(company.id, new_price, actualPrice.price * quantity);
            }
        }
        console.log("NPC Movements executed");
    } catch (err) {
        console.error("Internal Server Error: " + err.message + ". In line number: " + err.lineNumber );
    }
};