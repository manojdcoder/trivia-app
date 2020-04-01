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
    document.querySelector("#welcome").innerText = user && `Welcome, ${user}` || "Trivia";
    document.querySelector("#logout").classList[!user && "add" || "remove"]("d-none");
}

function syncQuestion(data) {
    const question = document.querySelector("#question-content");
    const template = document.querySelector("#tplQuestion");
    const qEl = template.content.cloneNode(true);

    let { text, type, options } = data;
    qEl.querySelector(".question-text").innerText = text;

    const isRadio = type === "radio";
    options = options.map((option, index) => {
        return `<label><input type="${type}" name="${isRadio && "radio" || `${type}-index`
            }">${option.text}</label>`;
    }).join("");

    qEl.querySelector(".question-options").innerHTML = options;

    question.append(qEl.firstElementChild);
}

function syncScoreboard(participants) {
    const currentUser = getUser();
    const scoreboard = document.querySelector("#scoreboard");
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
    });

    scoreboard.innerHTML = participants.join("");
}

function start() {
    setUser("Manoj");

    syncScoreboard([{
        username: "Manoj",
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

function onLogoutClick() {
    if (confirm("Are you sure, do you want to logout of current session?")) {
        setUser(null);
        syncScoreboard([]);
        syncQuestion([]);
    }
}

start();