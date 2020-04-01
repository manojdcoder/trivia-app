const USER_NAME = "username";

// Methods

function getUser() {
    return localStorage.getItem(USER_NAME);
}

function setUser(value) {
    if (value) {
        localStorage.setItem(USER_NAME, value);
    } else {
        localStorage.removeItem(USER_NAME);
    }
    syncUser();
}

function syncUser() {
    const user = getUser();
    const welcomeEl = document.querySelector("#welcome");
    const logoutEl = document.querySelector("#logout");

    let loginEl = document.querySelector(".login-form");
    if (user) {
        if (loginEl) {
            loginEl.addEventListener("animationend", () => {
                loginEl.remove();
            });
            loginEl.classList.add("login-animate-out");
        }
    } else {
        if (!loginEl) {
            const template = document.querySelector("#tplLogin");
            loginEl = template.content.cloneNode(true);
            document.body.append(loginEl.firstElementChild);
        }
    }

    welcomeEl.innerText = user && `${user}, Ready for a challenge?` || "Trivia";
    logoutEl.classList.toggle("d-none", !!!user);
}

function syncQuestion(data) {
    const questionContent = document.querySelector("#question-content");
    const oldQuestionEl = questionContent.firstElementChild;

    if (data) {
        const template = document.querySelector("#tplQuestion");
        const qEl = template.content.cloneNode(true);
        const questionEl = qEl.firstElementChild;

        let { text, type, options, hasMore } = data;
        qEl.querySelector(".question-text").innerText = text;

        const isRadio = type === "radio";
        options = options.map((option, index) => {
            return `<label><input type="${type}" name="${isRadio && "radio" || `${type}-index`
                }">${option.text}</label>`;
        }).join("");
        qEl.querySelector(".question-options").innerHTML = options;

        const questionActionsEl = document.querySelector(".question-actions");
        questionActionsEl.classList.toggle("show", false);
        questionActionsEl.classList.toggle("hide", true);

        const primaryActionEl = questionActionsEl.querySelector("#question-action-primary");
        if (hasMore) {
            primaryActionEl.innerText = "Next";
        } else {
            primaryActionEl.innerText = "Finish";
        }
        primaryActionEl.classList.toggle("finish", !hasMore);

        const showQuestionEl = () => {
            questionEl.classList.add("question-animate-in");
            questionEl.addEventListener("animationend", () => {
                questionActionsEl.classList.toggle("hide", false);
                questionActionsEl.classList.toggle("show", true);
            });
            questionContent.appendChild(questionEl);
        };

        if (oldQuestionEl) {
            oldQuestionEl.addEventListener("animationend", () => {
                oldQuestionEl.remove();
                showQuestionEl();
            });
            oldQuestionEl.classList.add("question-animate-out");
        } else {
            showQuestionEl();
        }
    } else if (oldQuestionEl) {
        oldQuestionEl.remove();
    }

    window.currentQuestion = data;
}

function syncScoreboard(participants) {
    const currentUser = getUser();
    const scoreboardEl = document.querySelector("#scoreboard");
    const template = document.querySelector("#tplParticipant");

    participants = participants.map(participant => {
        let { username, score } = participant;
        const pEl = template.content.cloneNode(true);

        if (username === currentUser) {
            username += " (You)";
            pEl.firstElementChild.classList.add("current-user");
        }

        pEl.querySelector(".participant-username").innerText = username;
        pEl.querySelector(".participant-score").innerText = score;

        return pEl.firstElementChild.outerHTML;
    }).join("");

    scoreboardEl.innerHTML = participants;
}

function dummyData() {
    syncScoreboard([{
        username: getUser(),
        score: 1750
    }, {
        username: "John",
        score: 1250
    }, {
        username: "Peter",
        score: 1150
    }]);

    syncQuestion({
        text: "When does the data in session storage expire?",
        type: "radio",
        hasMore: true,
        options: [{
            text: "When browser window is closed",
            valid: true
        }, {
            text: "When browser is closed",
            valid: false
        }, {
            text: "It never expires",
            valid: false
        }]
    });
}

// Events

function onLogin(event) {
    event.preventDefault();
    const targetEl = event.target;
    const parentEl = targetEl.parentElement;
    const value = targetEl.querySelector("input[type=text]").value;
    if (value) {
        setUser(value);
        dummyData();
    }
}

function onLogoutClick() {
    if (confirm("Are you sure, do you want to logout of current session?")) {
        setUser(null);
        syncScoreboard([]);
        syncQuestion();
    }
}

function onPrimaryActionClick() {
    const currentQuestion = window.currentQuestion;
    if (currentQuestion) {
        const { type, hasMore, options } = currentQuestion;

        const optionsEl = [...document.querySelector(".question-options").childNodes];
        const selectedOptions = [];
        options.forEach((option, index) => {
            const optionEl = optionsEl[index];
            if (optionEl
                && ((optionEl.firstElementChild
                    && optionEl.firstElementChild.checked)
                    || optionEl.value)) {
                selectedOptions.push(option);
            }
        });

        if (!selectedOptions.length && !confirm("Are you sure, do you want to skip this question?")) {
            return false;
        }

        if (hasMore) {
            syncQuestion({
                text: "Dummy question?",
                type: "checkbox",
                hasMore: false,
                options: [{
                    text: "Correct answer",
                    valid: true
                }, {
                    text: "Wrong answer",
                    valid: false
                }, {
                    text: "Correct answer",
                    valid: true
                }]
            });
        } else {

        }
    }
}

// Initiate
syncUser();
if (getUser()) {
    dummyData();
}