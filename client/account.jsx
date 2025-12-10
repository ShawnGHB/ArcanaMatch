const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

const handleDono = (e, scoreReload, accountId) => {
    e.preventDefault();
    helper.hideError();

    const amount = parseInt(e.target.querySelector('#score').value);

    if (!amount) {
        helper.handleError('Need to donate a value');
        return false;
    }

    // donater = window.USER_username;
    const donaterScore =parseInt(window.USER_score);

    if ((donaterScore - amount) < 0) {
        helper.handleError("You can't donate more than you have...");
        return false;
    }


    helper.sendPost(e.target.action, { amount, accountId }, scoreReload);
    return false;
};

const handleUpdate = (e, accountReload) => {
    e.preventDefault();
    helper.hideError();

    let pass = e.target.querySelector('#pass').value;
    let pass2 = e.target.querySelector('#pass2').value;
    let birthdayInp = e.target.querySelector('#birthday').value;
    let birthday = birthdayInp ? new Date(birthdayInp).toLocaleDateString() : null;

    if (((pass && !pass2) || (!pass && pass2))) {
        helper.handleError('Enter both pass fields to change');
        return false;
    }

    if(!birthday){
        birthday = null;
    }

    if(!pass && ! pass2){
        pass = null;
        pass2 = null;
    }

    helper.sendPost(e.target.action, { pass, pass2, birthday }, accountReload);
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
            <label htmlFor="pass">Old Password: </label>
            <input id="pass" type="password" name="pass" placeholder="Curr password" />
            <label htmlFor="pass2">Update Password?: </label>
            <input id="pass2" type="password" name="pass2" placeholder="New password" />

            <label htmlFor="birthday">Update Birthday?: </label>
            <input id="birthday" type="date" name="birthday" />

            <input className="formSubmit" type="submit" value="Update Account" />
        </form>
    );
};


//list all accounts on the server, can be donated to from user's points
const AccountList = (props) => {
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
                    <input id="score" type="number" min="0" name="score" />
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
    const [reloadAccounts, setReloadAccounts] = useState(false);

    return (<div>

        <Nav reload={reloadAccounts} />

        <div id="rollArea">
            <AccountForm triggerReload={() => setReloadAccounts(!reloadAccounts)} />
        </div>
        <div id="rolls">
            {/* triggers reload since there is a form inside of the account tiles */}
            <AccountList accounts={[]} reloadAccounts={reloadAccounts} triggerReload={() => setReloadAccounts(!reloadAccounts)} />
        </div>
    </div>
    );
};

const Nav = (props) => {

    const [account, setAccount] = useState({});

    useEffect(() => {
        //calls accountData from the server
        const loadAccount = async () => {
            const response = await fetch('/getUser');
            const data = await response.json();
            setAccount(data.account);
        };
        loadAccount();
    }, [props.reload]);

    return (
        <nav id="nav"><a href="/login"><img id="logo" src="/assets/img/card.jpg" alt="face logo" /></a>
            <div className="navlink"><a href="/logout">Log out</a></div>
            <div className="navlink"><a href="/account">User: {account.username} </a></div>
            <div className="navinfo">Birthday: {account.birthday}</div>
            <div className="navinfo">Zodiac: {account.zodiac}</div>
            <div className="navinfo">Score: {account.score}</div>
        </nav>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));

    root.render(<App />);
};

window.onload = init;