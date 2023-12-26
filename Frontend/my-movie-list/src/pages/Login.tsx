import { Container, TextField, Button, Box } from '@mui/material';

export default function Login() {
    return (
        <div>
            <div className="title-header">
                <h2>My Movie List</h2>
            </div>
            <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                height="91vh"
                width="100vw"
            >
                <Container 
                    maxWidth="xs"
                    sx={{
                        background: "#2a2a2c",
                        borderRadius: "10px",
                        padding: "20px",
                        margin: "auto",
                    }}
                >
                    <Box display="flex" flexDirection="column" alignItems="center" gap={4}>
                        <h1>Welcome Back</h1>
                        <TextField 
                            variant="standard"
                            label="email"
                            fullWidth
                            autoComplete="email"
                            autoFocus
                        />

                        <TextField
                            variant="standard"
                            label="password"
                            fullWidth
                        />
                        <Button variant="contained" color="primary" sx={{ width: '300px' }}>Log in</Button>
                    </Box>
                </Container>
            </Box>
        </div>
    );
}