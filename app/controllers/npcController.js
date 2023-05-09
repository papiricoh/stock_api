const User = require('../models/db');

exports.npcMovement = async (req, res) => {
    try {
        const all_companies_labels = await User.getAllCompaniesLabels();
        for (let index = 0; index < all_companies_labels.length; index++) {
            const company = await User.getCompanyData(all_companies_labels[index].company_label);
            
        }
        console.log("NPC Movements executed");
    } catch (err) {
        console.error("Internal Server Error: " + err.message );
    }
};