import React, { useState, useEffect } from "react";
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

export default function ViewProfile(
    {
        profile, 
        ProfilesContract, 
        setProfile, 
        showProfileDetails,
        setShowProfileDetails
    }) 
{
    const profileLoading = profile === null || profile === '';
    const [email, setEmail] = useState(profileLoading ? 'still loading' : profile.email);
    const [journalName, setJournalName] = useState(profileLoading ? 'still loading' : profile.journal_name);
    const [name, setName] = useState(profileLoading ? 'still loading' : profile.name);
    const [isEditing, setIsEditing] = useState(false);
    
    useEffect(() => {
        if (!profileLoading) {
            setName(profile.name);
            setEmail(profile.email);
            setJournalName(profile.journal_name);
        }
    }, [profile])

    const handleUpdateProfile = () => {

    }

    const submitButton = () => {
        return (
            <>
                <Row className='text-center'>
                    <Col>
                        <Button
                            variant="primary"
                            onClick={handleUpdateProfile}
                        >
                            Submit Changes
                        </Button>
                    </Col>
                </Row>
            </>
        )
    }

    return (
        <>
        <Modal
            show={showProfileDetails}
            onHide={() => setShowProfileDetails(false)}
            size='lg'
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>Details for {profile === null || profile === '' ? 'still loading' : profile.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
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
                                            disabled={isEditing ? "" : "disabled"}
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
                                            disabled={isEditing ? "" : "disabled"}
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
                                            disabled={isEditing ? "" : "disabled"}
                                        />
                                    </Col>
                                    <Col md={{span: 2, offset:0}}>
                                        <Form.Check.Input
                                            type='checkbox'
                                            onClick={() => setIsEditing(!isEditing)}
                                        />
                                        &nbsp;
                                        <Form.Check.Label
                                            style={{color: 'blue'}}
                                        >
                                            Edit Profile
                                        </Form.Check.Label>
                                    </Col>
                                </Row>
                            </Form.Group>
                        </Row>
                    </Form>
                    <br />
                    {isEditing ? submitButton() : ''}
            </Modal.Body>
        </Modal>
        </>
    );
}