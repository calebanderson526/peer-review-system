import "../../style/NavStyle.css";
import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Dropdown from 'react-bootstrap/Dropdown';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import profilePic from '../../static/profilepic.png';
const Web3 = require("web3");

export default function AccountButton(
    {
        account,
        setAccount,
        profile,
        disconnect,
        setShowProfileDetails,
        showCreateProfile,
        setShowCreateProfile
    }) {
    const [showDropdown, setShowDropdown] = useState(false);

    const handleClick = async () => {
        if (!isConnected) {
            connectAccount();
        }
    }

    const isConnected = (account !== null && account !== '');

    // connect account
    const connectAccount = async () => {
        if (window.ethereum) {
            await window.ethereum.request({ method: "eth_requestAccounts" })
                .then((res) => {
                    window.web3 = new Web3(window.ethereum);
                    setAccount();
                })
                .catch(() => {
                    console.log('login failed');
                });
        } else {
            // alert user to install metamask
            console.log('no wallet');
        }
    }

    const connectButton = () => {
        return (
            <>
                <Button
                    type="button"
                    onClick={handleClick}
                >
                    {isConnected ? "Connected" : "Connect Wallet"}
                </Button>
            </>
        );
    }

    const profileButton = () => {
        if (profile === null) {
            return (
                <>
                    <Dropdown.Item
                        onClick={e => setShowCreateProfile()}
                    >
                        Create Profile
                    </Dropdown.Item>
                </>
            )
        } else {
            return (
                <>
                    <Dropdown.Item
                        onClick={e => setShowProfileDetails()}
                    >
                        View Profile
                    </Dropdown.Item>
                </>
            )
        }
    }


    // this is not working
    // hover the box, and as soon as you try to select an item it disappears
    // click the box, and the hover functionality breaks

    // const show = () => {
    //     setShowDropdown(true);
    // }

    // const hide = () => {
    //     setShowDropdown(false);
    // }

    const profileDropdown = () => {
        return (
            <>
                <Dropdown
                    as={ButtonGroup}
                >
                    <Dropdown.Toggle><img
                        alt=""
                        src={profilePic}
                        width="25"
                        height="25"
                    /> {profile === null || profile === '' ? `${account.substring(0, 15)}...` : profile.name}</Dropdown.Toggle>
                    <Dropdown.Menu
                        show={showDropdown}
                    // onMouseEnter={show} broke
                    // onMouseLeave={hide}
                    >
                        {profileButton()}
                        <Dropdown.Item
                            onClick={disconnect}
                        >
                            Disconnect
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
            </>
        );
    }

    return (
        <>
            <div className="butt">
                {isConnected ? profileDropdown() : connectButton()}
            </div>
        </>
    );
}
