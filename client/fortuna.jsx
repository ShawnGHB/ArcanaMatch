const helper = require('./helper.js');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

//will handle bets being placed before rolls
const handleRoll = (e, onRollPlaced) => {
    e.preventDefault();
    helper.hideError();

    const bet = e.target.querySelector('#cardBet').value;


    if (!bet) {
        helper.handleError('Please Enter a bet');
        return false;
    }

    const zodiac = window.USER_zodiac //grabs straight from the session

    helper.sendPost(e.target.action, { bet, zodiac }, onRollPlaced);
    return false;
};

const BetForm = (props) => {
    return (
        <form id="betBox"
            onSubmit={(e) => handleRoll(e, props.triggerReload)}
            name="betForm"
            action="/fortuna"
            method="POST"
            className="betBox"
        >
            <label htmlFor="bet">Bet: </label>
            <input id="cardBet" type="number" min="0" name="bet" placeholder="Number Bet" />
            <input className="cardRollSubmit" type="submit" value="Take a Chance" />
        </form>
    );
};

const RollList = (props) => {
    const [rolls, setRolls] = useState(props.rolls);

    useEffect(() => {
        //calls all the rolls from the server
        const loadRollsFromServer = async () => {
            const response = await fetch('/getRolls');
            const data = await response.json();
            setRolls(data.rolls);
        };
        loadRollsFromServer();
    }, [props.reloadRolls]);

    if (rolls.length === 0) {
        return (
            <div className="rollList">
                <h3 className="emptyRoll">No Rolls Yet!</h3>
            </div>
        );
    }

    //The box for each Spread of Cards
    const rollNodes = rolls.map(roll => {
        return (
            <div key={roll._id} className="roll">

                {/* outcome summary above card */}
                <h3 className="rollScore">Score: {roll.score}</h3>
                {/* create spread of 5 cards across the box */}
                <div className="rollCards">
                    {/* maps cards to list of images in html format*/}
                    {roll.cards.map((card) => {
                        const file = encodeURIComponent(card);
                        const tarot = `/assets/tarot/${file}.jpg`;

                        return (
                            <div className="cardLayout">
                                <img src={tarot} alt={card} className='cardFace' />
                                <div className='cardLabel'>{card}</div>
                            </div>
                        )
                    })}
                </div>
                {/* boolean value determines win text, and changes color */}
                <h2 className="rollWin">{roll.win ? "Winner" : "Lost"}</h2>
            </div>
        );
    });
    return (
        <div className="rollList">
            {rollNodes}
        </div>
    );
};


const App = () => {
    const [reloadRolls, setReloadRolls] = useState(false);

    return (
        <div>
            <div id="rollArea">
                <BetForm triggerReload={() => setReloadRolls(!reloadRolls)} />
            </div>
            <div id="rolls">
                <RollList rolls={[]} reloadRolls={reloadRolls} />
            </div>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
};

window.onload = init;