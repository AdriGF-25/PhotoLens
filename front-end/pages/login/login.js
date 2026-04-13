var loginForm = document.getElementById('loginForm');
var emailInput = document.getElementById('email');
var passwordInput = document.getElementById('password');
var rememberUserInput = document.getElementById('rememberUser');
var togglePasswordButton = document.getElementById('togglePassword');
var emailError = document.getElementById('emailError');
var passwordError = document.getElementById('passwordError');
var formMessage = document.getElementById('formMessage');

function loadRememberedUser() {
    var savedEmailLocal = localStorage.getItem('photolensRememberedEmail');
    var savedEmailSession = sessionStorage.getItem('photolensSessionEmail');

    if (savedEmailLocal) {
        emailInput.value = savedEmailLocal;
        rememberUserInput.checked = true;
    } else if (savedEmailSession) {
        emailInput.value = savedEmailSession;
        rememberUserInput.checked = false;
    }
}

function togglePasswordVisibility() {
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        togglePasswordButton.classList.add('active');
        togglePasswordButton.setAttribute('aria-label', 'Ocultar contraseña');
    } else {
        passwordInput.type = 'password';
        togglePasswordButton.classList.remove('active');
        togglePasswordButton.setAttribute('aria-label', 'Mostrar contraseña');
    }
}

function validateEmail() {
    var emailValue = emailInput.value.trim();
    var emailPattern = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;

    emailError.textContent = '';

    if (emailValue === '') {
        emailError.textContent = 'Introduce tu correo electrónico.';
        return false;
    }

    if (!emailPattern.test(emailValue)) {
        emailError.textContent = 'Introduce un correo válido.';
        return false;
    }

    return true;
}

function validatePassword() {
    var passwordValue = passwordInput.value.trim();

    passwordError.textContent = '';

    if (passwordValue === '') {
        passwordError.textContent = 'Introduce tu contraseña.';
        return false;
    }

    if (passwordValue.length < 6) {
        passwordError.textContent = 'La contraseña debe tener al menos 6 caracteres.';
        return false;
    }

    return true;
}

function saveUserSession() {
    var emailValue = emailInput.value.trim();

    localStorage.removeItem('photolensRememberedEmail');
    sessionStorage.removeItem('photolensSessionEmail');

    if (rememberUserInput.checked) {
        localStorage.setItem('photolensRememberedEmail', emailValue);
    } else {
        sessionStorage.setItem('photolensSessionEmail', emailValue);
    }
}

function validateCaptcha() {
    if (typeof grecaptcha === 'undefined') {
        return true;
    }

    var captchaResponse = grecaptcha.getResponse();

    if (captchaResponse.length === 0) {
        formMessage.style.color = '#ff8a8a';
        formMessage.textContent = 'Completa el reCAPTCHA antes de continuar.';
        return false;
    }

    return true;
}

function handleSubmit(event) {
    event.preventDefault();

    formMessage.textContent = '';

    var emailIsValid = validateEmail();
    var passwordIsValid = validatePassword();
    var captchaIsValid = validateCaptcha();

    if (!emailIsValid || !passwordIsValid || !captchaIsValid) {
        return;
    }

    saveUserSession();

    formMessage.style.color = '#8fd6a8';
    formMessage.textContent = 'Formulario validado. El siguiente paso será conectarlo con tu backend.';
}

function handleGoogleResponse(response) {
    if (response && response.credential) {
        formMessage.style.color = '#8fd6a8';
        formMessage.textContent = 'Inicio de sesión con Google detectado. Falta enlazarlo con backend.';
    }
}

togglePasswordButton.addEventListener('click', togglePasswordVisibility);
loginForm.addEventListener('submit', handleSubmit);
emailInput.addEventListener('blur', validateEmail);
passwordInput.addEventListener('blur', validatePassword);

loadRememberedUser();

window.handleGoogleResponse = handleGoogleResponse;