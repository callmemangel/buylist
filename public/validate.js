function Validator() {

    this.labels = [];
    this.labels.push(document.getElementById('usname-label'));
    this.labels.push(document.getElementById('pass-label'));
    
    this.attrs = [];
    this.attrs.push(document.getElementById('reg-form').username.value);
    this.attrs.push(document.getElementById('reg-form').password.value);

    this.validateRegForm = () => {

        this.labels.push(document.getElementById('pass2-label'));
        this.attrs.push(document.getElementById('reg-form').password2.value);

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

function validate(type) {
    
    let validator = new Validator();

    if (type == 'reg') {
        return validator.validateRegForm();
    } else if (type == 'log') {
        return validator.validateLogForm();
    }

    console.log("bad type of request"); 
}
