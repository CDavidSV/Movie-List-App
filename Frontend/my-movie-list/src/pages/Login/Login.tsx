import { Link } from 'react-router-dom';
import InputField from '../../components/inputField-component/inputField';
import { useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { GlobalContext } from '../../contexts/GlobalContext';

export default function Login() {
    const [loginData, setLoginData] = useState<LoginData | null>(null);
    const [loginError, setLoginError] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setSessionData, mml_api } = useContext(GlobalContext);

    document.title = "Log In | My Movie List";

    const attemptLogin = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Reset error messages
        setErrorMessage("");
        setLoginError("");
        setLoading(true);
        mml_api.post("/auth/login", loginData, { headers: { "Content-Type" : "application/x-www-form-urlencoded" } })
        .then((response) => {
            setSessionData(response.data.responseData.userEmail, response.data.responseData.username, response.data.responseData.expiresIn, response.data.responseData.profilePicturePath);
            // If login is successful, store user data and redirect to home page
            navigate("/");
        }).catch((err) => {
            setLoginError("invalid");
            setErrorMessage(err.response.data.message);
        }).finally(() => setLoading(false));
    }

    return (
        <div>
            <div className="login-container">
                <form className="login-form" onSubmit={attemptLogin}>
                    <h1 style={{textAlign: "center"}}>Log In</h1>
                    {loginError && <p className="error-text">{errorMessage}</p>}
                    <InputField 
                        type="email" 
                        id="email" 
                        label="Email" 
                        required={true} 
                        onInputChange={(value: string) => setLoginData({ ...loginData!, username: value })} 
                        status={loginError}
                        autocomplete="email"/>
                    <div>
                        <InputField 
                            type="password" 
                            id="password" 
                            label="Password" 
                            required={true} 
                            onInputChange={(value: string) => setLoginData({ ...loginData!, password: value })} 
                            status={loginError}
                            autocomplete="current-password"/>
                        <Link to="/reset-password"><p className="forgot-password">Forgot Password</p></Link>
                    </div>
                    <button className="button primary" disabled={loading}>
                        {!loading && "Log In"}
                        {loading && <span className="spinning-loader"></span>}
                    </button>
                    <p style={{fontSize: "14px", textAlign: "center"}}>Don't have an account? <Link className="signup-btn" to="/signup">Sign up</Link></p>
                </form>
            </div>
        </div>
    );
}