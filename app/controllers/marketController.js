const User = require('../models/db');

exports.marketStatusMovement = async () => {
    try {
        const all_companies_labels = await User.getAllCompaniesLabels();
        for (let index = 0; index < all_companies_labels.length; index++) {
            const company = await User.getCompanyData(all_companies_labels[index].company_label);
            const status = await User.getCompanyStatus(company.id);
            
            
        }
        console.log("Market Status Updated");
    } catch (err) {
        console.error("Internal Server Error: " + err.message + ". In line number: " + err.lineNumber );
    }
};