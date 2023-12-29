import { Link } from 'react-router-dom';
import InputField from '../components/inputField-component/inputField';

export default function Login() {
    let username = "";
    let email = "";
    let password = "";
    let passwordConfirm = "";

    const attemptLogin = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log("Email: " + email);
        console.log("Password: " + password);
    }

    return (
        <div>
            <div className="title-header">
                <Link to="/"><h2>My Movie List</h2></Link>
            </div>
            <div className="login-container">
                <form className="signup-form" onSubmit={attemptLogin}>
                    <h1 style={{textAlign: "center"}}>Sign Up</h1>
                    <InputField type="text" id="email" label="Email" required={true} onInputChange={(value: string) => {email = value}}/>
                    <InputField type="text" id="username" label="Username" required={true} onInputChange={(value: string) => {username = value}}/>
                    <InputField type="password" id="password" label="Password" required={true} onInputChange={(value: string) => {password = value}}/>
                    <InputField type="password" id="password-confirm" label="Confirm Password" required={true} onInputChange={(value: string) => {passwordConfirm = value}}/>
                    
                    <button className="primary-button">Sign up</button>
                    <p style={{fontSize: "14px", textAlign: "center"}}>Already have an account? <Link className="signup-btn" to="/login">Log In</Link></p>
                </form>
            </div>
        </div>
    );
}