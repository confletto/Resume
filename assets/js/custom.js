document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded - form ready!');

    const contactForm = document.querySelector('.contact-form');
    if (!contactForm) return;
    
    const nameInput = document.getElementById('userName');
    const surnameInput = document.getElementById('userSurname');
    const emailInput = document.getElementById('userEmail');
    const phoneInput = document.getElementById('userPhone');
    const addressInput = document.getElementById('userAddress');
    const grade1Input = document.getElementById('labGrade1');
    const grade2Input = document.getElementById('labGrade2');
    const grade3Input = document.getElementById('labGrade3');
    const submitButton = contactForm.querySelector('button[type="submit"]');
    
    function showError(input, message) {
        const oldError = input.parentNode.querySelector('.simple-error');
        if (oldError) oldError.remove();
        
        if (message) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'simple-error';
            errorDiv.textContent = message;
            errorDiv.style.cssText = 'color: red; font-size: 12px; margin-top: 5px;';
            input.parentNode.appendChild(errorDiv);
            input.style.borderColor = 'red';
        } else {
            input.style.borderColor = 'green';
        }
    }
    
    function isEmpty(value) {
        return value.trim() === '';
    }
    
    function hasOnlyLetters(value) {
        return /^[A-Za-z\s\-]+$/.test(value);
    }
    
    function isEmailValid(email) {
        return email.includes('@') && email.includes('.') && email.length > 5;
    }
    
    function isGradeValid(grade) {
        const num = parseInt(grade);
        return !isNaN(num) && num >= 1 && num <= 10;
    }
    
    function setupSimpleValidation() {
        const allInputs = [nameInput, surnameInput, emailInput, addressInput, grade1Input, grade2Input, grade3Input];
        
        allInputs.forEach(input => {
            input.addEventListener('input', function() {
                checkOneField(this);
                updateButton();
            });
        });
        
        phoneInput.addEventListener('input', function() {
            formatPhone(this);
            updateButton();
        });
    }
    
    function checkOneField(input) {
        const value = input.value.trim();
        
        if (isEmpty(value)) {
            showError(input, 'This field is required');
            return false;
        }
        
        if (input === nameInput || input === surnameInput) {
            if (!hasOnlyLetters(value)) {
                showError(input, 'Only letters, spaces and hyphens allowed');
                return false;
            }
        }
        
        if (input === emailInput) {
            if (!isEmailValid(value)) {
                showError(input, 'Email must contain @ and .');
                return false;
            }
        }
        
        if (input === addressInput) {
            if (value.length < 5) {
                showError(input, 'Address too short (min 5 chars)');
                return false;
            }
        }
        
        if (input === grade1Input || input === grade2Input || input === grade3Input) {
            if (!isGradeValid(value)) {
                showError(input, 'Grade must be 1-10');
                return false;
            }
        }
        
        showError(input, '');
        return true;
    }
    
    function formatPhone(input) {
        let numbers = input.value.replace(/\D/g, '');
        
        if (numbers.startsWith('6')) {
            numbers = '370' + numbers;
        }
        
        let formatted = '';
        if (numbers.length > 0) {
            formatted = '+';
            
            if (numbers.length >= 3) {
                formatted += numbers.substring(0, 3) + ' ';
                numbers = numbers.substring(3);
            }
            
            if (numbers.length >= 3) {
                formatted += numbers.substring(0, 3) + ' ';
                numbers = numbers.substring(3);
            }
            
            if (numbers.length > 0) {
                formatted += numbers;
            }
            
            input.value = formatted;
        }
    }
    
    function updateButton() {
        const requiredFields = [nameInput, surnameInput, emailInput, addressInput, grade1Input, grade2Input, grade3Input];
        let allValid = true;
        
        for (let field of requiredFields) {
            if (!checkOneField(field)) {
                allValid = false;
            }
        }
        
        if (allValid) {
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
            submitButton.style.cursor = 'pointer';
        } else {
            submitButton.disabled = true;
            submitButton.style.opacity = '0.5';
            submitButton.style.cursor = 'not-allowed';
        }
    }

    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        if (submitButton.disabled) {
            alert('Please fix all errors before submitting!');
            return;
        }
        
        console.log('Form submitted!');
        
        const formData = {
            name: nameInput.value.trim(),
            surname: surnameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            address: addressInput.value.trim(),
            grade1: parseInt(grade1Input.value),
            grade2: parseInt(grade2Input.value),
            grade3: parseInt(grade3Input.value)
        };
        
        const average = (formData.grade1 + formData.grade2 + formData.grade3) / 3;
        formData.average = average.toFixed(1);
        
        console.log('Form Data:', formData);
        
        showResults(formData);
        
        showSuccess();
        
        setTimeout(() => {
            contactForm.reset();
            updateButton();
        }, 2000);
    });
    
    function showResults(data) {
        let resultsDiv = document.getElementById('simple-results');
        if (!resultsDiv) {
            resultsDiv = document.createElement('div');
            resultsDiv.id = 'simple-results';
            resultsDiv.style.cssText = `
                margin-top: 20px;
                padding: 15px;
                background: #f5f5f5;
                border-radius: 5px;
                border: 1px solid #ddd;
            `;
            contactForm.parentNode.insertBefore(resultsDiv, contactForm.nextSibling);
        }
        
        let color = 'black';
        const avg = parseFloat(data.average);
        if (avg < 4) color = 'red';
        else if (avg < 7) color = 'orange';
        else color = 'green';
        
        resultsDiv.innerHTML = `
            <h3>Submitted Data:</h3>
            <p><b>Name:</b> ${data.name}</p>
            <p><b>Surname:</b> ${data.surname}</p>
            <p><b>Email:</b> ${data.email}</p>
            <p><b>Phone:</b> ${data.phone || 'Not provided'}</p>
            <p><b>Address:</b> ${data.address}</p>
            <p><b>Grades:</b> ${data.grade1}, ${data.grade2}, ${data.grade3}</p>
            <hr>
            <p><b>Average:</b> 
                <span style="color: ${color}; font-weight: bold;">
                    ${data.name} ${data.surname}: ${data.average}
                </span>
            </p>
        `;
        resultsDiv.style.display = 'block';
    }
    
    function showSuccess() {
        alert('✅ Form submitted successfully!');
        
        const popup = document.createElement('div');
        popup.textContent = 'Form submitted successfully!';
        popup.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: purple;
            color: white;
            padding: 15px;
            border-radius: 5px;
            z-index: 1000;
        `;
        document.body.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 3000);
    }

    setupSimpleValidation();
    updateButton();
    
    console.log('Simple form handler ready!');

});
