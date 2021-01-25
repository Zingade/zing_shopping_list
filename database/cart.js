module.exports = function Cart(oldCart) {
    this.items = oldCart.items || {};
    this.totalQty = oldCart.totalQty || 0;
    this.totalPrice = oldCart.totalPrice || 0;

    this.add = function(item,id){
        var storedItem = this.items[id];
        if(!storedItem){
            storedItem = this.items[id] = {item:item,Qty:0, price:0};
        }
        storedItem.Qty++;
        storedItem.price = storedItem.item.productPrice * storedItem.Qty;
        this.totalQty++;
        this.totalPrice += (storedItem.item.productPrice * 1); 
    };

    this.generateArray = function(){
        var arr = [];
        for (var id in this.items) {
            arr.push(this.items[id]);
        }
        return arr;
    }
}