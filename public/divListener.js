document.addEventListener("DOMContentLoaded", addDivListeners);

function addDivListeners() {
    let elements = document.getElementsByClassName('tile-list');
    for (let i = 0; i < elements.length; i++) {
        elements[i].addEventListener("click", () => {
            let name = document.getElementById('list-name-' + i).innerHTML;
            location.href="/lists/" + name; 
        });
    }
}
