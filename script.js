const form = document.getElementById("donationForm");

const nameInput = document.getElementById("name");
const ssnInput = document.getElementById("ssn");
const personInput = document.getElementById("person");
const corporationInput = document.getElementById("corporation");
const ssnLabel = document.getElementById("ssnLabel");
const phoneInput = document.getElementById("phone");
const areaInput = document.getElementById("area");
const agreementInput = document.getElementById("agree");

const ssnMessage = document.getElementById("ssnMessage");
const phoneMessage = document.getElementById("phoneMessage");
const applicationFields = document.getElementById("applicationFields");
const confirmation = document.getElementById("confirmation");
const confirmationMessage = document.getElementById("confirmationMessage");
const completeButton = document.getElementById("completeButton");
const editButton = document.getElementById("editButton");
const familyTotalYes = document.getElementById("familyTotalYes");
const familyTotalNo = document.getElementById("familyTotalNo");
const familyNamesFields = document.getElementById("familyNamesFields");
const familyNames = document.getElementById("familyNames");

let maskedSsnValue = null;

function getIdentificationNumber() {
    return maskedSsnValue === null ? ssnInput.value : maskedSsnValue;
}

function restoreIdentificationNumber() {
    ssnInput.value = getIdentificationNumber();
    maskedSsnValue = null;
}

function maskValidRRN() {
    const value = getIdentificationNumber();
    if (!validateRRN(value)) {
        return false;
    }
    maskedSsnValue = value;
    ssnInput.value = `${value.replace(/-/g, "").substring(0, 6)}-*******`;
    return true;
}

function updateIdentificationField() {
    restoreIdentificationNumber();
    const isCorporation = corporationInput.checked;
    ssnLabel.textContent = isCorporation ? "법인 사업자번호" : "주민등록번호";
    ssnInput.placeholder = isCorporation ? "법인 사업자번호를 입력하세요" : "예) 900101-1234567";
    if (isCorporation) {
        ssnInput.removeAttribute("maxlength");
    } else {
        ssnInput.maxLength = 14;
        maskValidRRN();
    }
    ssnMessage.textContent = "";
    ssnMessage.className = "";
}

personInput.addEventListener("change", updateIdentificationField);
corporationInput.addEventListener("change", updateIdentificationField);
updateIdentificationField();

ssnInput.addEventListener("focus", restoreIdentificationNumber);

function updateFamilyNamesFields() {
    familyNamesFields.hidden = !familyTotalYes.checked;
    familyNamesFields.disabled = !familyTotalYes.checked;
}

familyTotalYes.addEventListener("change", updateFamilyNamesFields);
familyTotalNo.addEventListener("change", updateFamilyNamesFields);
updateFamilyNamesFields();

document.getElementById("addFamilyName").addEventListener("click", function () {
    const row = familyNames.firstElementChild.cloneNode(true);
    const name = row.querySelector('[name="familyNames"]');
    const percentage = row.querySelector('[name="familyPercentages"]');
    const index = familyNames.children.length + 1;
    name.value = "";
    percentage.value = "";
    name.setAttribute("aria-label", `가족 이름 ${index}`);
    percentage.setAttribute("aria-label", `가족 비율 ${index}`);
    familyNames.appendChild(row);
    name.focus();
});

function getFamilyMembers() {
    return familyTotalYes.checked
        ? Array.from(familyNames.children, row => ({
            name: row.querySelector('[name="familyNames"]').value.trim(),
            percentage: row.querySelector('[name="familyPercentages"]').value
        }))
        : [];
}

/*
 * 주민등록번호 자동 하이픈
 * 1234561234567
 * ↓
 * 123456-1234567
 */
ssnInput.addEventListener("input", function () {

    maskedSsnValue = null;

    if (corporationInput.checked) {
        return;
    }

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

    if (corporationInput.checked) {
        return;
    }

    if (this.value.trim() === "") {
        return;
    }

    if (maskValidRRN()) {

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


let submissionAttempt = null;

class SubmissionError extends Error {}

function validateFunctionUrl() {
    if (!firebaseSettings.functionUrl) {
        throw new SubmissionError("Firebase 함수 URL 설정이 완료되지 않았습니다. 관리자에게 문의해주세요.");
    }
    let functionUrl;
    try {
        functionUrl = new URL(firebaseSettings.functionUrl);
    } catch (error) {
        throw new SubmissionError("Firebase 함수 URL 설정을 확인해주세요.");
    }
    if (functionUrl.protocol !== "https:" &&
        !(functionUrl.protocol === "http:" && ["localhost", "127.0.0.1"].includes(functionUrl.hostname))) {
        throw new SubmissionError("Firebase 함수 URL은 HTTPS를 사용해야 합니다.");
    }
}

async function handleDonationSubmit(dataset) {
    const payload = JSON.stringify(dataset);
    if (!submissionAttempt || submissionAttempt.payload !== payload) {
        if (!globalThis.crypto || !globalThis.crypto.randomUUID) {
            throw new SubmissionError("안전한 연결에서 신청해주세요.");
        }
        submissionAttempt = { payload, requestId: globalThis.crypto.randomUUID() };
    }

    validateFunctionUrl();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);
    try {
        const response = await fetch(firebaseSettings.functionUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ requestId: submissionAttempt.requestId, submission: dataset }),
            signal: controller.signal
        });
        if (!response.ok) {
            if (response.status === 400) {
                throw new SubmissionError("입력 내용을 확인한 뒤 다시 신청해주세요.");
            }
            if (response.status === 401 || response.status === 403) {
                throw new SubmissionError("서버 접근 설정을 확인해주세요. 관리자에게 문의해주세요.");
            }
            if (response.status === 409) {
                throw new SubmissionError("기존 신청과 내용이 다릅니다. 관리자에게 문의해주세요.");
            }
            throw new Error("신청 전송에 실패했습니다.");
        }
        const result = await response.json();
        if (result.ok !== true) {
            throw new Error("서버 응답을 확인하지 못했습니다. 다시 시도해주세요.");
        }
    } finally {
        clearTimeout(timeout);
    }
}

form.addEventListener("submit", function (e) {

    e.preventDefault();

    if (!corporationInput.checked && !maskValidRRN()) {

        alert("주민등록번호를 확인해주세요.");
        ssnInput.focus();
        return;
    }

    if (!validatePhone(phoneInput.value)) {

        alert("전화번호를 확인해주세요.");
        phoneInput.focus();
        return;
    }    

    document.getElementById("confirmName").textContent = nameInput.value;
    document.getElementById("confirmSsnLabel").textContent = ssnLabel.textContent;
    document.getElementById("confirmSsn").textContent = getIdentificationNumber();
    document.getElementById("confirmPhone").textContent = phoneInput.value;
    document.getElementById("confirmArea").textContent = areaInput.value;
    document.getElementById("confirmFamilyTotalRequest").textContent =
        familyTotalYes.checked ? "예" : "아니오";
    document.getElementById("confirmFamilyNamesRow").hidden = !familyTotalYes.checked;
    document.getElementById("confirmFamilyNames").textContent = getFamilyMembers()
        .map(member => member.percentage === "" ? member.name : `${member.name} (${member.percentage}%)`)
        .join(", ");

    confirmationMessage.hidden = true;
    confirmationMessage.textContent = "";
    completeButton.disabled = false;
    applicationFields.hidden = true;
    confirmation.hidden = false;
    document.getElementById("confirmationTitle").focus();
});

editButton.addEventListener("click", function () {
    confirmation.hidden = true;
    applicationFields.hidden = false;
    nameInput.focus();
});

completeButton.addEventListener("click", async function () {
    const familyMembers = getFamilyMembers();
    const dataset = {
        personOrCorp: corporationInput.checked ? "corporation" : "person",
        name: nameInput.value,
        ssn: getIdentificationNumber(),
        phone: phoneInput.value,
        area: areaInput.value,
        familyTotalRequest: familyTotalYes.checked ? "yes" : "no",
        familyNames: familyMembers.map(member => member.name),
        familyMembers: familyMembers,
        agree: agreementInput.checked
    };

    completeButton.disabled = true;
    editButton.disabled = true;
    confirmationMessage.textContent = "신청 내용을 전송하고 있습니다.";
    confirmationMessage.hidden = false;
    try {
        await handleDonationSubmit(dataset);
        confirmationMessage.textContent = "신청이 완료되었습니다.";
    } catch (error) {
        console.error("신청 전송에 실패했습니다.");
        confirmationMessage.textContent = error instanceof SubmissionError
            ? error.message
            : "전송 결과를 확인하지 못했습니다. 저장되었을 수도 있으므로 새로고침하지 말고 다시 시도해주세요.";
        completeButton.disabled = false;
        editButton.disabled = false;
    }
});