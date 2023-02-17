import "./style/NavStyle.css";
import "./style/AppStyle.css";
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import React, { Component } from "react";
import Container from "react-bootstrap/Container";
import Editor from './components/pages/Editor';
import Review from './components/pages/Review';
import Author from './components/pages/Author';
import companyLogo from './static/DERPMINI.png';
import editorButton from './static/editorButton.png';
import reviewerButton from './static/ReviewerButton.png';
import authorButton from './static/authorButton.png';
import reputationButton from './static/reputationButtonV2.png';
import AccountButton from './components/general/AccountButton.js'
import {
    BrowserRouter,
    Routes,
    Route,
    NavLink,
    Link
} from "react-router-dom";
import Row from 'react-bootstrap/Row';
import Home from './components/pages/Home.js'
import Web3 from 'web3';
import PRContractABI from './static/PRContractABI.json';
import ProfilesABI from './static/ProfilesABI.json';
import CreateProfile from './components/modals/CreateProfile.js';
import ViewProfile from './components/modals/ViewProfile.js';
import WrongChain from "./components/modals/WrongChain";
import Reputation from "./components/pages/Reputation";

class App extends Component {
    constructor(props) {
        super(props);
        const PRContractAddress = process.env.REACT_APP_REVIEW_CONTRACT;
        const web3 = new Web3(window.ethereum);
        var PRContract =
            new web3.eth.Contract(PRContractABI, PRContractAddress);
        const profAddress = '0xAf5226585a77fEF444aF54EF9aC3b4647FeA2161';
        var ProfContract =
            new web3.eth.Contract(ProfilesABI, profAddress);
        this.state = {
            account: null,
            chainId: null,
            authorBounties: null,
            editorBounties: null,
            reviewerBounties: null,
            PRContract: PRContract,
            profile: null,
            ProfilesContract: ProfContract,
            showProfileDetails: false,
            showCreateProfile: false,
            web3: web3
        }

        this.setAccount = this.setAccount.bind(this);
        this.setChainId = this.setChainId.bind(this);
        this.getBounties = this.getBounties.bind(this);
        this.getAccountData = this.getAccountData.bind(this);
        this.getProfile = this.getProfile.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.setShowProfileDetails = this.setShowProfileDetails.bind(this);
        this.detectAccountUpdate = this.detectAccountUpdate.bind(this);
        this.setShowCreateProfile = this.setShowCreateProfile.bind(this);
    }

    componentDidMount() {
        this.detectAccountUpdate();
        this.setAccount();
    }

    setShowProfileDetails() {
        this.setState({ showProfileDetails: !this.state.showProfileDetails });
    }

    setShowCreateProfile() {
        console.log(this.state.showCreateProfile);
        this.setState({ showCreateProfile: !this.state.showCreateProfile })
    }

    async setAccount() {
        const addr = (await this.state.web3.eth.getAccounts())[0];
        this.setState(
            { account: addr ? addr : null },
            () => addr ? this.getAccountData() : '');
    }

    detectAccountUpdate() {
        window.ethereum.on('accountsChanged', async function (accounts) {
            window.location.reload();
        })
        window.ethereum.on('chainChanged', async function () {
            window.location.reload();
        })
    }

    disconnect() {
        this.setState({
            account: null,
            reviewerBounties: null,
            authorBounties: null,
            editorBounties: null
        });
    }

    async getAccountData() {
        var cid = await this.state.web3.eth.getChainId();
        this.setState({ chainId: cid })
        this.getProfile();
        this.getBounties();
    }

    async getProfile() {
        const prof = await this.state.ProfilesContract.methods.getProfileByAddress(
            this.state.account
        ).call();
        if (prof.addr == this.state.account) {
            this.setState({ profile: prof });
        }
    }

    setProfile(prof) {
        this.setState({ profile: prof });
    }

    async getBounties() {
        const authorBounties =
            await this.state.PRContract.methods.getBountiesByAuthor(
                this.state.account
            ).call();
        this.setState({ authorBounties: authorBounties });

        const editorBounties =
            await this.state.PRContract.methods.getBountiesByEditor(
                this.state.account
            ).call();
        this.setState({ editorBounties: editorBounties });

        const reviewerBounties =
            await this.state.PRContract.methods.getBountiesByReviewer(
                this.state.account
            ).call();
        this.setState({ reviewerBounties: reviewerBounties });
    }

    setChainId(chainId) {
        this.setState({ chainId: chainId });
    }
    setChainId(chainId) {
        this.setState({ chainId: chainId });
    }

    render() {
        return (
            <div className="App">
                <BrowserRouter>
                    <Container fluid>
                        <Row>
                            <Navbar className="navbar" variant="dark" expand="lg">
                                <Navbar.Brand as={NavLink} to="/">
                                    {' '}
                                    <img
                                        alt=""
                                        src={companyLogo}
                                        width="32"
                                        height="40"
                                    //className="d-inline-block align-top"
                                    />{' '}
                                    derp
                                </Navbar.Brand>
                                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                                <Navbar.Collapse id="basic-navbar-nav">
                                    <Nav className="navtext me-auto">
                                        <Nav.Link as={NavLink} to="/author">
                                            <img
                                                alt=""
                                                src={authorButton}
                                                width="32"
                                                height="40"
                                            />
                                            {' '}Author
                                        </Nav.Link>
                                        <Nav.Link as={NavLink} to="/editor">
                                            <img
                                                alt=""
                                                src={editorButton}
                                                width="32"
                                                height="40"
                                            />
                                            {' '} Editor
                                        </Nav.Link>
                                        <Nav.Link as={NavLink} to="/review">
                                            <img
                                                alt=""
                                                src={reviewerButton}
                                                width="32"
                                                height="40"
                                            />
                                            {' '}Reviewer
                                        </Nav.Link>
                                        <Nav.Link as={NavLink} to="/reputation">
                                            <img
                                                alt=""
                                                src={reputationButton}
                                                width="32"
                                                height="40"
                                            />
                                            {' '}Reputation
                                        </Nav.Link>
                                    </Nav>
                                    <AccountButton
                                        account={this.state.account}
                                        setAccount={this.setAccount}
                                        profile={this.state.profile}
                                        disconnect={this.disconnect}
                                        showProfileDetails={this.state.showProfileDetails}
                                        setShowProfileDetails={this.setShowProfileDetails}
                                        showCreateProfile={this.showCreateProfile}
                                        setShowCreateProfile={this.setShowCreateProfile}
                                    />
                                </Navbar.Collapse>
                            </Navbar>
                        </Row>
                        <CreateProfile
                            disconnect={this.disconnect}
                            account={this.state.account}
                            ProfilesContract={this.state.ProfilesContract}
                            setProfile={this.setProfile}
                            profile={this.state.profile}
                            web3={this.state.web3}
                            chainId={this.state.chainId}
                            showCreateProfile={this.state.showCreateProfile}
                            setShowCreateProfile={this.setShowCreateProfile}
                        />
                        <ViewProfile
                            profile={this.state.profile}
                            ProfilesContract={this.state.ProfilesContract}
                            setProfile={this.setProfile}
                            showProfileDetails={this.state.showProfileDetails}
                            setShowProfileDetails={this.setShowProfileDetails}
                        />
                        <WrongChain
                            account={this.state.account}
                            disconnect={this.disconnect}
                            chainId={this.state.chainId}
                        />
                    </Container>
                    <div>
                        <Routes>
                            <Route path="/author"
                                element={
                                    <Author
                                        chainId={this.state.chainId}
                                        account={this.state.account}
                                        authorBounties={this.state.authorBounties}
                                        PRContract={this.state.PRContract}
                                    />} />
                            <Route path="/editor"
                                element={
                                    <Editor
                                        chainId={this.state.chainId}
                                        account={this.state.account}
                                        editorBounties={this.state.editorBounties}
                                        PRContract={this.state.PRContract}
                                    />
                                }
                            />
                            <Route path="/review"
                                element={
                                    <Review
                                        chainId={this.state.chainId}
                                        account={this.state.account}
                                        reviewerBounties={this.state.reviewerBounties}
                                        PRContract={this.state.PRContract}
                                        profile={this.state.profile}
                                    />
                                } 
                            />
                            <Route path="/"
                                element={
                                <Home PRContract={this.state.PRContract} />
                                } 
                            />
                            <Route path="/reputation"
                                element={<Reputation
                                    PRContract={this.state.PRContract}
                                    account={this.state.account}
                                />}
                            />
                        </Routes>
                    </div>
                </BrowserRouter>
            </div>
        )
    }
}
export default App;