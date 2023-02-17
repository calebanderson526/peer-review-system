import React from "react";
import Col from "react-bootstrap/Col";
import Row from 'react-bootstrap/Row';
import Button from "react-bootstrap/Button";
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import ERC20ABI from '../../static/ERC20ABI.json';
import * as IPFS from 'ipfs-http-client';
import bs58 from 'bs58'
import {Buffer} from 'buffer';
const Web3 = require("web3");


class OpenBountyModal extends React.Component {
    constructor(props) {
        super(props);
        const web3 = new Web3(window.ethereum);
        this.state = {
            article: null,
            editor: null,
            token:null,
            amount:null,
            web3: web3
        }
        
        this.handleOpenBounty = this.handleOpenBounty.bind(this);
    }
    async handleOpenBounty() {
        
        //IDK IF I LIKE THIS (Will be converted into secrets later)
        const projectId = process.env.REACT_APP_IPFS_ID;
        const projectSecret = process.env.REACT_APP_IPFS_SECRET;
        const authorization = "Basic " + btoa(projectId + ":" + projectSecret);

        if (!this.state.web3.utils.isAddress(this.state.token)) {
            alert('Token entered is not a valid eth address!')
            return
        } else if (!this.state.web3.utils.isAddress(this.state.editor)) {
            alert('Editor entered is not a valid eth address!')
            return
        } else if (this.state.article === null) {
            alert('Must choose a file as your article')
            return
        } else if (this.state.amount === null) {
            alert('Must choose an amount for your bounty')
            return
        }

        const node = await IPFS.create({
            url: process.env.REACT_APP_IPFS_URL,
            headers: {
                authorization,
            },});
        const results = await node.add(this.state.article);
        var tokenContract = new this.state.web3.eth.Contract(
            ERC20ABI, this.state.token
        );
        var allowance = await tokenContract.methods.allowance(
            this.props.account, this.props.PRContract.options.address
        ).call();
        if (allowance < this.state.amount) {
            var approve = await tokenContract.methods.approve(
                this.props.PRContract.options.address, this.state.amount
            ).send({from: this.props.account});
            console.log(approve);
        }
        const str = Buffer.from(bs58.decode(results.path)).toString('hex')
        this.props.PRContract.methods.openBounty(
            this.state.token,
            this.state.editor,
            this.state.amount,
            '0x'+str.substring(4, str.length)
        ).send({from: this.props.account})
        .on('confirmation', (receipt) => {
            window.location.reload();
        })
        this.props.handleCloseOpenForm();
        this.setState({
            token: '',
            editor: '',
            amount:0,
            article:null
        });
    }
    render() {
        return (
            <Modal 
                show={this.props.showOpenForm} 
                onHide={this.props.handleCloseOpenForm}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Open a Bounty</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Row>
                            <Form.Group as={Col}>
                                <Row className='align-items-center'>
                                    <Col md={{span:2}}>
                                        <Form.Label>Article:</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control 
                                            type="file"
                                            onChange={e => this.setState({ article: e.target.files[0] })}
                                        />
                                    </Col>
                                </Row>
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Row className='align-items-center'>
                                    <Col md={{span:2}}>
                                        <Form.Label>Editor:</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control 
                                            type="text"
                                            placeholder='editor address'
                                            value={this.state.editor}
                                            onChange={e => this.setState({ editor: e.target.value })}
                                        />
                                    </Col>
                                </Row>
                            </Form.Group>
                        </Row>
                        <br />
                        <Row>
                            <Form.Group as={Col}>
                                <Row className='align-items-center'>
                                    <Col md={{span:2}}>
                                        <Form.Label>Token:</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control 
                                            type="text" 
                                            placeholder="Token Address"
                                            value={this.state.token}
                                            onChange={e => this.setState({ token: e.target.value })}
                                        />
                                    </Col>
                                </Row>
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Row className='align-items-center'>
                                    <Col md={{span:2}}>
                                        <Form.Label>Amount:</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control 
                                            type="number"
                                            placeholer="Ether"
                                            value={this.state.amount}
                                            onChange={e => this.setState({ amount: e.target.value })}
                                            step="any"
                                        />
                                    </Col>
                                </Row>
                            </Form.Group>
                        </Row>
                        <br />
                        <Row>
                            <Col md={{offset:5}}>
                                <Button
                                    onClick={this.handleOpenBounty}
                                >
                                    Submit Bounty
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
            </Modal>
        )
    }
}

export default OpenBountyModal;