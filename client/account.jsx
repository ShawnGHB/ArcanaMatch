const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

const handleDono = (e, scoreReload, accountId) => {
    e.preventDefault();
    helper.hideError();

    const score = e.target.querySelector('#donoScore').value;

    if (!score) {
        helper.handleError('Need to donate a value');
        return false;
    }

    const donaterScore = window.score;

    if((donaterScore - score) < 0){
        helper.handleError("You can't donate more than you have...");
        return false;
    }

    helper.sendPost(e.target.action, {amount, accountId}, scoreReload);
    return false;
};

const handleUpdate = (e, accountReload) => {
    e.preventDefault();
    helper.hideError();

    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;
    const birthday = e.target.querySelector('#birthday').value;


    if (((pass || pass2) && pass != pass2)) {
        helper.handleError('Enter both pass fields(correctly) to change');
        return false;
    }

    helper.sendPost(e.target.action, { pass, age, birthday }, triggerReload);
    return false;
};

// the account form that handles updating account values
const AccountForm = (props) => {
    return (
        <form id="updateForm"
            onSubmit={(e) => handleUpdate(e, props.triggerReload)}
            name="updateForm"
            action="/update"
            method="POST"
            className="accountForm"
        >
            <label htmlFor="pass">Update Password?: </label>
            <input id="pass" type="password" name="pass" placeholder="password" />
            <label htmlFor="pass2">Password: </label>
            <input id="pass2" type="password" name="pass2" placeholder="retype password" />

            <label htmlFor="birthday">Update Birthday?: </label>
            <input id="birthday" type="date" name="birthday"  />

            <input className="formSubmit" type="submit" value="Update Account" />
        </form>
    );
};


//list all accounts on the server, can be donated to from user's points
const Accountlist = (props) => {
    const [accounts, setAccounts] = useState(props.accounts);

    useEffect(() => {
        const loadAccountsFromServer = async () => {
            const response = await fetch('/getAccounts');
            const data = await response.json();
            setAccounts(data.accounts);
        };
        loadAccountsFromServer();
    }, [props.reloadAccounts]);

    if (accounts.length === 0) {
        return (
            <div className="accountList">
                <h3 className="empty">No Accounts Yet!</h3>
            </div>
        );
    }

    const accountNodes = accounts.map(account => {
        return (
            <div key={account._id} className="account">
                <img src="/assets/img/profile.png" alt="profile" className="profilePhoto" />
                <h3 className="userName">Name: {account.name}</h3>
                <h3 className="userZodiac">Zodiac: {account.zodiac}</h3>
                <h3 className="userScore">Score: {account.score}</h3>
                {/* form at the bottom of the account data for if the user would like to donate to another */}
                <form className="accountDono"
                    onSubmit={(e) => handleDono(e, props.triggerReload, account._id)}
                    name="donoForm"
                    action="/donation"
                    method="POST"
                >
                    <label htmlFor="score">Points: </label>
                    <input id="donoScore" type="number" min="0" name="score" />
                    <input className="makeDonoSubmit" type="submit" value="Make Donation" />
                </form>
            </div>
        );
    });
    return (
        <div className="accountList">
            {accountNodes}
        </div>
    );
};


const App = () => {
    const [reloadAccounts, setReloadRolls] = useState(false);

    return (
        <div>
            <div id="accountArea">
                <AccountForm triggerReload={() => setReloadAccounts(!reloadAccounts)} />
            </div>
            <div id="accounts">
                <Accountlist accounts={[]} reloadAccounts={reloadAccounts} />
            </div>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('content'));
    root.render(<App />);
};

window.onload = init;