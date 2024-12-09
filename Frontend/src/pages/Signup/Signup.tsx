import { Link, useNavigate } from 'react-router-dom';
import InputField from '../../components/inputField-component/inputField';
import { useContext, useState } from 'react';
import { GlobalContext } from '../../contexts/GlobalContext';

export default function SignUp() {
    const [signUpData, setSignUpData] = useState<SignUpData | null>(null);
    const [signUpErrors, setSignUpErrors] = useState<SignUpError>({ usernameError: '', emailError: '', passwordError: '' });
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setSessionData, mml_api } = useContext(GlobalContext);

    document.title = "Sign Up | My Movie List";

    const attemptSignUp = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (signUpData!.password.length < 8) {
            setSignUpErrors({ ...signUpErrors!, passwordError: 'invalid' });
            setErrorMessage("Password must be at least 8 characters long");
            return;
        }

        if (signUpData!.password !== signUpData!.passwordConfirm) {
            setSignUpErrors({ ...signUpErrors!, passwordError: 'invalid' });
            setErrorMessage("Passwords do not match");
            return;
        }

        // Reset error messages
        setSignUpErrors({ usernameError: 'valid', emailError: 'valid', passwordError: 'valid' });
        setErrorMessage("");
        setLoading(true);
        mml_api.post("/auth/register",
        {
            email: signUpData!.email,
            username: signUpData!.username,
            password: signUpData!.password
        },
        { headers: { "Content-Type" : "application/x-www-form-urlencoded" } })
        .then((response) => {
            setSessionData(
                response.data.responseData.userEmail,
                response.data.responseData.username,
                response.data.responseData.expiresIn,
                response.data.responseData.matureContent,
                response.data.responseData.publicWatchlist,
                response.data.responseData.publicFavorites
            );

            navigate("/");
        }).catch(((err) => {
            const message = err.response.data.message;

            switch (message) {
                case "Username already in use":
                    setSignUpErrors({ ...signUpErrors!, usernameError: 'invalid' });
                    setErrorMessage("Username already in use");
                    break;
                case "Email already in use":
                    setSignUpErrors({ ...signUpErrors!, emailError: 'invalid' });
                    setErrorMessage("Email already in use");
                    break;
                default:
                    setErrorMessage(message);
                    break;
            }
        })).finally(() => setLoading(false));
    }

    return (
        <div>
            <div className="login-container">
                <form className="signup-form" onSubmit={attemptSignUp}>
                    <h1 style={{textAlign: "center"}}>Sign Up</h1>
                    {errorMessage && <p className="error-text">{errorMessage}</p>}
                    <InputField
                        type="email"
                        id="email"
                        label="Email"
                        required={true}
                        onInputChange={(value: string) => setSignUpData({...signUpData!, email: value})}
                        status={signUpErrors.emailError}
                        autocomplete="off"/>
                    <InputField
                        type="username"
                        id="username"
                        label="Username"
                        required={true}
                        onInputChange={(value: string) => setSignUpData({...signUpData!, username: value})}
                        status={signUpErrors.usernameError}
                        autocomplete="off"/>
                    <InputField
                        type="password"
                        id="password"
                        label="Password"
                        required={true}
                        onInputChange={(value: string) => setSignUpData({...signUpData!, password: value})}
                        status={signUpErrors.passwordError}
                        autocomplete="new-password"/>
                    <InputField
                        type="password"
                        id="password-confirm"
                        label="Confirm Password"
                        required={true}
                        onInputChange={(value: string) => setSignUpData({...signUpData!, passwordConfirm: value})}
                        status={signUpErrors.passwordError}
                        autocomplete="new-password"/>

                    <button className="button primary" disabled={loading}>
                        {!loading && "Sign Up"}
                        {loading && <span className="spinning-loader"></span>}
                    </button>
                    <p style={{fontSize: "14px", textAlign: "center"}}>Already have an account? <Link className="signup-btn" to="/login">Log In</Link></p>
                </form>
            </div>
        </div>
    );
}
