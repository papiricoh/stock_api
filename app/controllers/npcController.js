const User = require('../models/db');

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
            
        }
        console.log("NPC Movements executed");
    } catch (err) {
        console.error("Internal Server Error: " + err.message );
    }
};