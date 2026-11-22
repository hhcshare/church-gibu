const form = document.getElementById("donationForm");

const ssnInput = document.getElementById("ssn");
const phoneInput = document.getElementById("phone");

const ssnMessage = document.getElementById("ssnMessage");
const phoneMessage = document.getElementById("phoneMessage");

/*
 * 주민등록번호 자동 하이픈
 * 1234561234567
 * ↓
 * 123456-1234567
 */
ssnInput.addEventListener("input", function () {

    let value = this.value.replace(/\D/g, "");

    if (value.length > 6) {
        value =
            value.substring(0, 6) +
            "-" +
            value.substring(6, 13);
    }

    this.value = value;
});


/*
 * 전화번호 자동 하이픈
 */
phoneInput.addEventListener("input", function () {

    let value = this.value.replace(/\D/g, "");

    if (value.length < 4) {
        this.value = value;
    }
    else if (value.length < 8) {
        this.value =
            value.substring(0, 3) +
            "-" +
            value.substring(3);
    }
    else {
        this.value =
            value.substring(0, 3) +
            "-" +
            value.substring(3, 7) +
            "-" +
            value.substring(7, 11);
    }
});


/*
 * 주민등록번호 검증
 */
function validateRRN(rrn) {

    const number = rrn.replace(/-/g, "");

    if (!/^\d{13}$/.test(number)) {
        return false;
    }

    const weights =
        [2,3,4,5,6,7,8,9,2,3,4,5];

    let sum = 0;

    for(let i = 0; i < 12; i++) {
        sum += Number(number[i]) * weights[i];
    }

    const checkDigit =
        (11 - (sum % 11)) % 10;

    return checkDigit === Number(number[12]);
}


/*
 * 전화번호 검증
 */
function validatePhone(phone) {

    const number = phone.replace(/-/g, "");

    return /^01[016789]\d{8}$/.test(number);
}


/*
 * 주민번호 입력 완료 후 검증
 */
ssnInput.addEventListener("blur", function () {

    if (this.value.trim() === "") {
        return;
    }

    if (validateRRN(this.value)) {

        ssnMessage.textContent =
            "올바른 주민등록번호입니다.";

        ssnMessage.className =
            "success";
    }
    else {

        ssnMessage.textContent =
            "유효하지 않은 주민등록번호입니다.";

        ssnMessage.className =
            "error";
    }
});


/*
 * 전화번호 입력 완료 후 검증
 */
phoneInput.addEventListener("blur", function () {

    if (this.value.trim() === "") {
        return;
    }

    if (validatePhone(this.value)) {

        phoneMessage.textContent =
            "올바른 전화번호입니다.";

        phoneMessage.className =
            "success";
    }
    else {

        phoneMessage.textContent =
            "전화번호 형식이 올바르지 않습니다.";

        phoneMessage.className =
            "error";
    }
});


/*
 * 제출
 */
form.addEventListener("submit", function (e) {

    e.preventDefault();

    if (!validateRRN(ssnInput.value)) {

        alert("주민등록번호를 확인해주세요.");
        ssnInput.focus();
        return;
    }

    if (!validatePhone(phoneInput.value)) {

        alert("전화번호를 확인해주세요.");
        phoneInput.focus();
        return;
    }

    const name =
        document.getElementById("name").value;

    alert(
        `${name}님\n전자 기부금 영수증 신청이 접수되었습니다.`
    );

    form.reset();

    ssnMessage.textContent = "";
    phoneMessage.textContent = "";
});