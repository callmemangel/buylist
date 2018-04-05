function Validator() {

    this.labels = [];
    this.labels.push(document.getElementById('usname-label'));
    this.labels.push(document.getElementById('pass-label'));
    
    this.attrs = [];
    this.attrs.push(document.getElementById('form').username.value);
    this.attrs.push(document.getElementById('form').password.value);

    this.validateRegForm = () => {

        this.labels.push(document.getElementById('pass2-label'));
        this.attrs.push(document.getElementById('form').password2.value);

        let retval = false;
        let badPassLabel = document.getElementById('badpasslabel');

        if (this.attrs[1] != this.attrs[2]) {
            show(badPassLabel);
        } else {
            if (this.attrs[0] && this.attrs[1] && this.attrs[2]) {
               retval = true; 
            }
            hide(badPassLabel); 
        }
        this.setLabels(); 
        return retval;
    }

    this.validateLogForm = () => {
        if (this.attrs[0] && this.attrs[1]) {
            return true;
        }

        this.setLabels();
        return false;
    }    

    this.setLabels = () => {
        for (let i = 0; i < this.labels.length; i++) {
            if (!this.attrs[i]) {
                this.labels[i].style.color = 'red'; 
            } else {
                this.labels[i].style.color = 'black'; 
            }
        } 
    }
}

function show(elem) {
    elem.style.display = "block";
}

function hide(elem) {
    elem.style.display = "none";
}

function validateCreateForm() {
    let value = document.getElementById('list-name').value;
    let labelColor = document.getElementById('list-name-label').style;

    if (value) {
        labelColor.color = 'black';
        return true;
    } else {
        labelColor.color = 'red';
        return false;
    }
}

function validate(type) {
    if (type == 'register') {
        let validator = new Validator();
        return validator.validateRegForm();
    } else if (type == 'login') {
        let validator = new Validator();
        return validator.validateLogForm();
    } else if (type == 'create')
        return validateCreateForm();

    console.log("bad type of request"); 
}
