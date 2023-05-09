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
            let quantity = Math.floor(Math.random() * 50) + Number(1);
            const canBuy = Boolean(company.shares.avariableShares - quantity >= 0);
            const canSell = Boolean(currentShares - quantity >= 0);
            let emaWindow = 10;//Number of days
            if(emaWindow > company.history.length) {
                emaWindow = company.history.length;
            }
            let emaData = [];
            for (let index = 0; index < company.history.length; index++) {
                emaData[index] = company.history[index].price;
            }
            const ema = await calculateEMA( emaData, emaWindow);
            console.log(company.company_label + " Ema: -> " + ema);
            //IF EMA > actual_price -> Price down (Buy??)
            //IF EMA < actual_price -> Price up (Sell??)
        }
        console.log("NPC Movements executed");
    } catch (err) {
        console.error("Internal Server Error: " + err.message );
    }
};