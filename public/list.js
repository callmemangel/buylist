function validate() {
    var itemName = document.getElementById('item');
    if (!itemName.value) {
        itemName.style.borderColor = 'red';
        return false;
    } 
    return true;
}


function remove() {

    var items = document.getElementById('items');

    let count = 0;

    for (let i = 0; i < items.children[0].children.length - 1; i++) {
        if(items.children[0].children[i].children[0].checked) {
            count++;
        }
    }

    if (count == 0) {
        return false; 
    }
    return true;

//    let query = window.location.href.split('/');
//    let listName = query[query.length - 1];

}
