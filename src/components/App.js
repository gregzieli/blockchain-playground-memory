/* eslint-disable jsx-a11y/alt-text */
import React, { Component } from "react";
import Web3 from "web3";
import "./App.css";
import MemoryToken from "../abis/MemoryToken.json";
import brain from "../brain.png";
import cards from "./cards";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      account: "0x0",
      token: null,
      totalSupply: 0,
      tokenURIs: [],
      cardArray: [],
      cardsChosen: [],
      cardsChosenId: [],
      cardsWon: [],
    };
  }

  async componentDidMount() {
    await loadWeb3();
    await this.loadBlockchainData();
    this.setState({ cardArray: cards.sort(() => 0.5 - Math.random()) });
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });

    const networkId = await web3.eth.net.getId();
    const { abi, networks } = MemoryToken;

    const networkData = networks[networkId];
    if (networkData) {
      const token = new web3.eth.Contract(abi, networkData.address);
      const totalSupply = await token.methods.totalSupply().call();

      this.setState({ token, totalSupply });

      const balanceOf = await token.methods.balanceOf(accounts[0]).call();
      for (let i = 0; i < balanceOf; i++) {
        const id = await token.methods.tokenOfOwnerByIndex(accounts[0], i).call();
        const tokenUri = await token.methods.tokenURI(id).call();
        this.setState({
          tokenURIs: [...this.state.tokenURIs, tokenUri],
        });
      }
    } else {
      alert("Smart contract not deployed to selected network");
    }
  }

  chooseImage = cardId => {
    cardId = cardId.toString();
    if (this.state.cardsWon.includes(cardId)) {
      return `${window.location.origin}/images/white.png`;
    } else if (this.state.cardsChosenId.includes(cardId)) {
      return cards[cardId].img;
    } else {
      return `${window.location.origin}/images/blank.png`;
    }
  };

  flipCard = async cardId => {
    const alreadyChosen = this.state.cardsChosen.length;

    this.setState({
      cardsChosen: [...this.state.cardsChosen, this.state.cardArray[cardId].name],
      cardsChosenId: [...this.state.cardsChosenId, cardId],
    });

    if (alreadyChosen === 1) {
      setTimeout(this.checkForMatch, 100);
    }
  };

  checkForMatch = async () => {
    const [optionOneId, optionTwoId] = this.state.cardsChosenId;
    if (optionOneId === optionTwoId) {
      alert("You have clicked the same image!");
    } else if (this.state.cardsChosen[0] === this.state.cardsChosen[1]) {
      alert("You found a match");
      this.state.token.methods
        .mint(this.state.account, window.location.origin + cards[optionOneId].img.toString())
        .send({ from: this.state.account })
        .on("transactionHash", _hash => {
          this.setState({
            cardsWon: [...this.state.cardsWon, optionOneId, optionTwoId],
            tokenURIs: [...this.state.tokenURIs, cards[optionOneId].img],
          });
        });
    } else {
      alert("Sorry, try again");
    }
    this.setState({
      cardsChosen: [],
      cardsChosenId: [],
    });
    if (this.state.cardsWon.length === cards.length) {
      alert("Congratulations! You found them all!");
    }
  };

  render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={brain} width="30" height="30" className="d-inline-block align-top" alt="" />
            &nbsp; Memory Tokens
          </a>
          <ul className="navbar-nav px-3">
            <li className="nav-item text-nowrap d-none d-sm-none d-sm-block">
              <small className="text-muted">
                <span id="account">{this.state.account}</span>
              </small>
            </li>
          </ul>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <h1 className="d-4">Start matching!</h1>

                <div className="grid mb-4">
                  {this.state.cardArray.map((card, key) => {
                    return (
                      <img
                        key={key}
                        src={this.chooseImage(key)}
                        data-id={key}
                        onClick={event => {
                          const cardId = event.target.getAttribute("data-id");
                          if (!this.state.cardsWon.includes(cardId.toString())) {
                            this.flipCard(cardId);
                          }
                        }}
                      />
                    );
                  })}
                </div>

                <div>
                  <h5>
                    Tokens Collected:<span id="result">&nbsp;{this.state.tokenURIs.length}</span>
                  </h5>

                  <div className="grid mb-4">
                    {this.state.tokenURIs.map((tokenURI, key) => {
                      return <img key={key} src={tokenURI} />;
                    })}
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

const loadWeb3 = async () => {
  if (window.ethereum) {
    window.web3 = new Web3(window.ethereum);
    await window.ethereum.enable();
  } else if (window.web3) {
    window.web3 = new Web3(window.web3.currentProvider);
  } else {
    window.alert("Install Metamask!");
  }
};

export default App;
