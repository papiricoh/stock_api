const User = require('../models/db');

async function calculateEMA(data, window) {
    var multiplier = 2 / (window + 1);
    // create a copy of the data
    var emaArr = data.slice(0);

    // Seed the first value
    var seed = data.slice(0, window).reduce((total, curr) => total + curr) / window;

    // Calculate EMA
    for (var i = 0; i < data.length; i++) {
        if (i < window) {
            emaArr[i] = seed;
        } else {
            emaArr[i] = (data[i] - emaArr[i - 1]) * multiplier + emaArr[i - 1];
        }
    }

    return emaArr;
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
            
        }
        console.log("NPC Movements executed");
    } catch (err) {
        console.error("Internal Server Error: " + err.message );
    }
};