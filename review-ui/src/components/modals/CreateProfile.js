import React, { useState } from "react";
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

export default function CreateProfile({
    disconnect, 
    account, 
    ProfilesContract, 
    setProfile, 
    profile,
    web3, 
    chainId,
    showCreateProfile,
    setShowCreateProfile
}) {
    const [email, setEmail] = useState(null);
    const [journalName, setJournalName] = useState(null);
    const [name, setName] = useState(null);


    // const showNoProfile = () => {
    //     var ret = true;
    //     ret = ret && (account !== null && account !== '');
    //     ret = ret && (profile === null && chainId === 5);
    //     return (ret);
    // }

    const handleDisconnect = () => {
        disconnect();
    }

    const handleCreateProfile = async () => {
        await ProfilesContract.methods.createProfile(name, journalName, email)
        .send({from: account})
        .on('confirmation', (receipt) => {
            window.location.reload();
        });
        var newProfile = await ProfilesContract.methods.getProfileByAddress(account).call()
        setProfile(newProfile);
    }

    return (
        <>
            <Modal
                show={showCreateProfile}
                onHide={() => setShowCreateProfile()}
                backdrop="static"
                keyboard={false}
                size="lg"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Looks like you don't have a profile yet!</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <h5>Make your profile</h5>
                    </Row>
                    <br />
                    <Form>
                        <Row>
                            <Form.Group as={Col}>
                                <Row className='align-items-center'>
                                    <Col md={{span:3}}>
                                        <Form.Label>Username:</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control 
                                            type="text"
                                            placeholder="username"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                        />
                                    </Col>
                                </Row>
                            </Form.Group>
                            <Form.Group as={Col}>
                                <Row className='align-items-center'>
                                    <Col md={{span:4}}>
                                        <Form.Label>Journal Name:</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control 
                                            type="text"
                                            placeholder="Name of your current journal"
                                            value={journalName}
                                            onChange={e => setJournalName(e.target.value)}
                                        />
                                    </Col>
                                </Row>
                            </Form.Group>
                        </Row>
                        <br />
                        <Row>
                        <Form.Group as={Col}>
                                <Row className='align-items-center'>
                                    <Col md={{span:1}}>
                                        <Form.Label>Email:</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control 
                                            type="text"
                                            placeholder="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                        />
                                    </Col>
                                </Row>
                            </Form.Group>
                        </Row>
                    </Form>
                    <br />
                    <Row className='text-center'>
                        <Col>
                            <Button
                                variant="danger"
                                onClick={() => handleDisconnect()}
                            >
                                Disconnect
                            </Button>
                        </Col>
                        <Col>
                            <Button
                                variant="primary"
                                onClick={handleCreateProfile}
                            >
                                Submit
                            </Button>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </>
    );
}