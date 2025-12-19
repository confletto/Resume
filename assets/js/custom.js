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
    
    // Set initial value to +370
    if (!phoneInput.value || phoneInput.value.trim() === '') {
        phoneInput.value = '+370 ';
    }
    
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
        
        phoneInput.addEventListener('input', function(e) {
            formatPhone(this);
            checkPhoneField(this);
            updateButton();
        });
        
        // Prevent phone field from being empty (always keep +370)
        phoneInput.addEventListener('blur', function() {
            if (this.value.trim() === '' || this.value.trim() === '+370') {
                this.value = '+370 ';
            }
        });
        
        // Prevent deleting the +370 prefix
        phoneInput.addEventListener('keydown', function(e) {
            const cursorPos = this.selectionStart;
            const value = this.value;
            
            // Prevent backspace/delete if it would remove +370
            if ((e.key === 'Backspace' && cursorPos <= 5) || 
                (e.key === 'Delete' && cursorPos < 5)) {
                e.preventDefault();
            }
        });
        
        // Prevent non-digit characters from being typed
        phoneInput.addEventListener('keypress', function(e) {
            const char = String.fromCharCode(e.which);
            if (!/[0-9]/.test(char)) {
                e.preventDefault();
            }
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
        // Store cursor position
        const cursorPos = input.selectionStart;
        
        // Extract only digits
        let digits = input.value.replace(/\D/g, '');
        
        // Remove 370 prefix if user typed it
        if (digits.startsWith('370')) {
            digits = digits.substring(3);
        }
        
        // Limit to 9 digits (after +370)
        if (digits.length > 9) {
            digits = digits.substring(0, 9);
        }
        
        // Always start with +370
        let formatted = '+370';
        
        // Add the rest of the digits with spacing
        if (digits.length > 0) {
            formatted += ' ' + digits.substring(0, 3);
        }
        if (digits.length > 3) {
            formatted += ' ' + digits.substring(3, 9);
        }
        
        // Add space after +370 if no digits yet
        if (digits.length === 0) {
            formatted += ' ';
        }
        
        input.value = formatted;
        
        // Keep cursor at the end for easier typing
        const newPos = formatted.length;
        input.setSelectionRange(newPos, newPos);
    }
    
    function checkPhoneField(input) {
        const value = input.value.trim();
        
        // Extract digits only (excluding the 370 prefix)
        const digits = value.replace(/\D/g, '').substring(3);
        
        // Phone is now required
        if (digits.length === 0) {
            showError(input, 'Phone number is required');
            return false;
        }
        
        // Check if it's a valid Lithuanian number (9 digits after 370)
        if (digits.length < 9) {
            showError(input, 'Phone number is too short (need 9 digits)');
            return false;
        }
        
        // Check if mobile number starts with 6-9
        const firstDigit = digits.charAt(0);
        if (!/[6-9]/.test(firstDigit)) {
            showError(input, 'Invalid Lithuanian phone number');
            return false;
        }
        
        showError(input, '');
        return true;
    }
    
    function updateButton() {
        // Now phone is also required
        const requiredFields = [nameInput, surnameInput, emailInput, phoneInput, addressInput, grade1Input, grade2Input, grade3Input];
        let allValid = true;
        
        for (let field of requiredFields) {
            if (field === phoneInput) {
                if (!checkPhoneField(field)) {
                    allValid = false;
                }
            } else {
                if (!checkOneField(field)) {
                    allValid = false;
                }
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
            phoneInput.value = '+370 '; // Reset phone to show +370
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
            <p><b>Phone:</b> ${data.phone}</p>
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
