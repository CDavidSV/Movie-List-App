import { Link } from 'react-router-dom';
import Header from '../components/header-component/header';
import InputField from '../components/inputField-component/inputField';

export default function Login() {
    let email = "";
    let password = "";

    const attemptLogin = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log("Email: " + email);
        console.log("Password: " + password);
    }

    return (
        <div>
            <Header />
            <div className="login-container">
                <form className="login-form" onSubmit={attemptLogin}>
                    <h1 style={{textAlign: "center"}}>Log In</h1>
                    <InputField type="text" id="email" label="Email" required={true} onInputChange={(value: string) => {email = value}}/>

                    <div>
                        <InputField type="password" id="password" label="Password" required={true} onInputChange={(value: string) => {password = value}}/>
                        <Link to="/reset-password"><p className="forgot-password">Forgot Password</p></Link>
                    </div>
                    <button className="primary-button">Log in</button>
                    <p style={{fontSize: "14px", textAlign: "center"}}>Don't have an account? <Link className="signup-btn" to="/signup">Sign up</Link></p>
                </form>
            </div>
        </div>
    );
}