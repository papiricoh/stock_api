const BuySell = {
    async buy(actualPrice, quantity, avariableShares) {
        let ratio = Number(quantity) / Number(avariableShares);
        let newPrice = Number(actualPrice) * (1 + ratio);
        console.log('buy method: ' + newPrice);
        return newPrice.toFixed(2);
    },
    async sell(currentPrice, quantity, sharesInCirculation) {
        let ratio = Number(quantity) / Number(sharesInCirculation);
        let newPrice = Number(currentPrice) * (1 - ratio);
        if(newPrice <= 0) {
            newPrice = 0.01;
        }
        console.log('sell method: ' + newPrice);
        return newPrice.toFixed(2);
    }
}
module.exports = BuySell;