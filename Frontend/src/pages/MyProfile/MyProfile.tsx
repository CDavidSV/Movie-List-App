import { useContext, useEffect, useState } from 'react';
import defaultPfp from '../../assets/images/profile-default.png';
import { useNavigate } from 'react-router-dom';
import InputField from '../../components/inputField-component/inputField';
import Modal from '../../components/modal-component/modal';
import UploadImage from '../../components/upload-image/upload-image';
import { GlobalContext } from '../../contexts/GlobalContext';
import "./myprofile.css";
import { ToastContext } from '../../contexts/ToastContext';

function ChangeUsername ({ username }: { username: string }) {
    const [oldUsername, setOldUsername] = useState<string>(username);
    const [newUsername, setNewUsername] = useState<string>(username);
    const [saveDisabled, setsaveDisabled] = useState<boolean>(true);
    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<boolean>(false);
    const { userData, mml_api_protected } = useContext(GlobalContext);

    const { updateUsername } = useContext(GlobalContext);

    const changeUsername = (e: React.FormEvent) => {
        e.preventDefault();
        setError(false);
        setMessage("");

        setsaveDisabled(true);
        mml_api_protected.post('/api/v1/user/change-username', { username: newUsername }).then(() => {
            const oldSessionData = userData;

            if (oldSessionData) {
                oldSessionData.username = newUsername;
                localStorage.setItem('sessionData', JSON.stringify(oldSessionData));
                setMessage("Username changed successfully.");
                setOldUsername(newUsername);
                updateUsername(newUsername);

                setTimeout(() => {
                    setMessage("");
                }, 3000);
            } else {
                setMessage("An error occurred. Please try again.");
                setError(true);
            }
        }).catch((err) => {
            setMessage(err.response.data.message || "An error occurred. Please try again.");
            setError(true);
            setsaveDisabled(false);
        });
    }

    // When username is changed by the user
    const onInputChange = (value: string) => {
        setNewUsername(value);
        setsaveDisabled(false);
    }

    useEffect(() => {
        if (oldUsername === newUsername) {
            setsaveDisabled(true);
        }
    }, [newUsername]);

    return (
        <div>
            {message.length > 0 && <p className={error ? "error-text" : "success-text"}>{message}</p>}
            <form onSubmit={changeUsername} className="profile-input-field">
                <InputField
                    type="username"
                    label="Username"
                    id="username"
                    required={false}
                    onInputChange={onInputChange}
                    defaultValue={username}
                    status={error ? "invalid" : ""}
                />
                <button className="button" disabled={saveDisabled}>Save</button>
            </form>
        </div>
    );
}

function AccDelPassConf({ onCancel }: { onCancel: () => void }) {
    const [password, setPassword] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [confirmDisabled, setConfirmDisabled] = useState<boolean>(true);
    const { clearSessionData, mml_api_protected } = useContext(GlobalContext);

    const attemptAccountDeletion = (e: React.FormEvent) => {
        e.preventDefault();
        setConfirmDisabled(true);
        setMessage("");

        // Delete the user's account. :(
        mml_api_protected.delete('/api/v1/user/delete-account', { data: { password }, headers: { "Content-Type": "application/x-www-form-urlencoded"} }).then(() => {
            clearSessionData();
            window.location.href = "/login";
        }).catch((err) => {
            setConfirmDisabled(false);
            setMessage(err.response.data.message || "An error occurred.");
        });
    }

    const onPasswordChange = (value: string) => {
        setPassword(value);
        if (value.length >= 8) {
            setConfirmDisabled(false);
        }
    }

    return (
        <div className="modal-content">
        <h3>Please enter your password</h3>
        <p>Once you click the confirm button your account will be deleted <strong>forever.</strong></p>
        {message.length > 0 && <p className="error-text">{message}</p>}
        <form onSubmit={attemptAccountDeletion}>
            <InputField
                type="password"
                label="Password"
                id="password"
                required={true}
                onInputChange={onPasswordChange} 
                autocomplete="off"/>
        <div className="modal-buttons">
            <button type="button" className="button" onClick={onCancel}>Cancel</button>
            <button className="button danger" disabled={confirmDisabled}>Confirm</button>
        </div>
        </form>
    </div>
    );
}

function ChangePasswordTab() {
    const [passwordChangeInfo, setPasswordChangeInfo] = useState<{ currentPassword: string, newPassword: string, confirmNewPassword: string, deleteSessions: boolean }>({ currentPassword: '', newPassword: '', confirmNewPassword: '',  deleteSessions: false });
    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const { mml_api_protected } = useContext(GlobalContext);

    const attemptPasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");
        setLoading(true);

        if (passwordChangeInfo.newPassword !== passwordChangeInfo.confirmNewPassword) {
            setMessage("New passwords do not match.");
            setError(true);
            setLoading(false);
            return;
        }

        mml_api_protected.post('/auth/change-password', {
            oldPassword: passwordChangeInfo.currentPassword,
            newPassword: passwordChangeInfo.newPassword,
            deleteAllSessions: passwordChangeInfo.deleteSessions
        }).then((response) => {
            setMessage(response.data.message);
            setError(false);
            setLoading(false);
            setPasswordChangeInfo({ currentPassword: '', newPassword: '', confirmNewPassword: '', deleteSessions: passwordChangeInfo.deleteSessions });
        }).catch((err) => {
            setMessage(err.response.data.message || "An error occurred. Please try again.");
            setError(true);
            setLoading(false);
        })
        setError(false);
    }

    return (
        <div className="profile-page-tab">
            <div>
                <h4 style={{margin: "0 0 15px 0"}}>Change Password</h4>
                <p className={error ? "error-text" : "success-text"}>{message}</p>
                <form className="change-password-container" onSubmit={attemptPasswordChange}>
                    <input style={{  display: "none" }} type="text" name="username" autoComplete="email"/>
                    <InputField
                        type="password"
                        label="Current Password"
                        id="current-password"
                        required={true}
                        value={passwordChangeInfo.currentPassword}
                        status={error ? "invalid" : ""}
                        onInputChange={(value) => setPasswordChangeInfo({ ...passwordChangeInfo, currentPassword: value })}
                        autocomplete="off"
                    />
                    <InputField
                        type="password"
                        label="New Password"
                        id="new-password"
                        required={true}
                        value={passwordChangeInfo.newPassword}
                        status={error ? "invalid" : ""}
                        onInputChange={(value) => setPasswordChangeInfo({ ...passwordChangeInfo, newPassword: value })}
                        autocomplete="new-password"
                    />
                    <InputField
                        type="password"
                        label="Confirm New Password"
                        id="confirm-new-password"
                        required={true}
                        value={passwordChangeInfo.confirmNewPassword}
                        status={error ? "invalid" : ""}
                        onInputChange={(value) => setPasswordChangeInfo({ ...passwordChangeInfo, confirmNewPassword: value })}
                        autocomplete="new-password"
                    />
                    <div>
                        <input checked={passwordChangeInfo.deleteSessions} type="checkbox" id="delete-sessions" onChange={(e) => setPasswordChangeInfo({ ...passwordChangeInfo, deleteSessions: e.target.checked })} />
                        <label 
                        style={{ marginLeft: "10px", fontSize: "0.9rem"}} 
                        htmlFor="delete-sessions">
                            Sign out of all devices except this one
                        </label>
                    </div>
                    <button className="button primary">
                        {!loading && "Change Password"}
                        {loading && <span className="spinning-loader"></span>}
                    </button>
                </form>
            </div>
        </div>
    );
}

function GeneralTab() {
    const [accountDeletionModal, setAccountDeletionModal] = useState<boolean>(false);
    const [accountDeletionPassModal, setAccountDeletionPassModal] = useState<boolean>(false);
    const { userData } = useContext(GlobalContext);

    return (
        <div className="profile-page-tab">
            <Modal open={accountDeletionModal} onClose={() => setAccountDeletionModal(false)}>
                <div className="modal-content">
                    <h3>Are you sure you want to delete your account?</h3>
                    <p style={{margin: "0 0 15px 0", opacity: "0.5", fontSize: "0.8rem"}}>This action cannot be undone.</p>
                    <div className="modal-buttons">
                        <button className="button danger" onClick={() => {
                            setAccountDeletionModal(false)
                            setAccountDeletionPassModal(true)
                            }}>Delete Account</button>
                        <button className="button" onClick={() => setAccountDeletionModal(false)}>Cancel</button>
                    </div>
                </div>
            </Modal>
            <Modal open={accountDeletionPassModal} onClose={() => setAccountDeletionPassModal(false)}>
                <AccDelPassConf onCancel={() => setAccountDeletionPassModal(false)}/>
            </Modal>
            <div>
                <h4 style={{margin: "0 0 15px 0"}}>Change Username</h4>
                <ChangeUsername username={userData ? userData.username : ''}/>
                <div style={{marginTop: "40px"}}>
                    <h4 style={{margin: "0"}}>Account Removal</h4>
                    <p style={{margin: "0 0 10px 0", opacity: "0.5", fontSize: "0.8rem"}}>This will delete your account and all data associated with it. This action cannot be undone.</p>
                    <button className="button danger" onClick={() => setAccountDeletionModal(true)}>Delete Account</button>
                </div>
            </div>
        </div>
    );
}

export default function MyProfile() {
    const navigate = useNavigate();
    const { userData, updateUserData, mml_api_protected } = useContext(GlobalContext);
    const [selectedTab, setSelectedTab] = useState<number>(0);
    const [modalsState, setModalsState] = useState<{ pfpModal: boolean, bannerModal: boolean }>({ pfpModal: false, bannerModal: false });
    const toast = useContext(ToastContext);

    useEffect(() => {
        document.title = "Profile | My Movie List";

        if (!userData) {
            navigate('/login');
        }
    }, []);

    const changeTab = (e: React.MouseEvent) => {
        setSelectedTab(parseInt(e.currentTarget.id));
    }

    const onPfpChange = async (newPfp: string) => {
        const formData = new FormData();
        const blob = await fetch(newPfp).then((res) => res.blob());
        formData.append('image', blob);

        setModalsState({ ...modalsState, pfpModal: false });
        toast.open("Uploading profile picture...");
        mml_api_protected.post('/api/v1/user/change-profile-picture', formData, { headers: { "Content-Type": "multipart/form-data" } }).then(() => {
            updateUserData();
            toast.open("Profile picture updated successfully.", "success");
        }).catch(() => {
            toast.open("Failed to update profile picture. Please try again.", "error");
        });
    }

    const onBannerChange = async (newBanner: string) => {
        const formData = new FormData();
        const blob = await fetch(newBanner).then((res) => res.blob());
        formData.append('image', blob);

        setModalsState({ ...modalsState, bannerModal: false });
        toast.open("Uploading profile banner...");
        mml_api_protected.post('/api/v1/user/change-profile-banner', formData, { headers: { "Content-Type": "multipart/form-data" } }).then(() => {
            updateUserData();
        }).then(() => {
            toast.open("Profile banner updated successfully.", "success");
        }).catch(() => {
            toast.open("Failed to update profile banner. Please try again.", "error");
        });
    }

    const tabs = [<GeneralTab/>, <ChangePasswordTab />];
    
    return (
        <div className="content">
            <div className="profile-wallpaper">
                {userData && userData.profileBannerUrl && <img src={`${userData.profileBannerUrl}`} alt="profile_banner" />}
                <div onClick={() => setModalsState({ ...modalsState, bannerModal: true })} className="upload_banner"><span style={{}} className="material-icons">image</span></div>
                <Modal open={modalsState.bannerModal} onClose={() => setModalsState({ ...modalsState, bannerModal: false })}>
                    <UploadImage onCrop={onBannerChange} aspectRatio={16 / 9} height="35vh" maxImageSizeInMb={16}/>
                </Modal>
            </div>
            <div className="content-wrapper">
                <div className="profile-general-data">
                    <div className="profile-picture">
                        <img src={userData && userData.profilePictureUrl ? `${userData.profilePictureUrl}` : defaultPfp} alt="profile_picture" />
                        <div onClick={() => setModalsState({ ...modalsState, pfpModal: true })} className="upload_pfp"><span style={{}} className="material-icons">photo_camera</span></div>
                        <Modal open={modalsState.pfpModal} onClose={() => setModalsState({ ...modalsState, pfpModal: false })}>
                            <UploadImage onCrop={onPfpChange} aspectRatio={1} height="50vh" maxImageSizeInMb={8}/>
                        </Modal>
                    </div>
                    <div className="user-info">
                        <h4>{userData && userData.username}</h4>
                        <p>{userData && userData.email}</p>
                    </div>
                </div>
                <div className="profile-config-tabs">
                    <div className="profile-tabs">
                        <ul className="profile-tabs-list">
                            <li id="0" onClick={changeTab} className={selectedTab === 0 ? "selected" : ""}>General</li>
                            <li id="1" onClick={changeTab} className={selectedTab === 1 ? "selected" : ""}>Change Password</li>
                        </ul>
                    </div>
                    <div className="profile-tab-content">
                        {tabs[selectedTab]}
                    </div>
                </div>
            </div>
        </div>
    );
}