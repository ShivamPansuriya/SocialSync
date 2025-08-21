import { useState } from 'react';
import { Box, Button, Container, TextField, Typography, Paper } from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import styles from '@/styles/landing.module.css';

const schema = Yup.object({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(8, 'At least 8 characters').required('Required'),
});

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 12, animation: 'fadeInUp 0.6s ease-out' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome back
        </Typography>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={schema}
          onSubmit={async (values) => {
            setLoading(true);
            // TODO: call backend auth API
            await new Promise((r) => setTimeout(r, 800));
            setLoading(false);
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && !!errors.email}
                helperText={touched.email && errors.email}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Password"
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && !!errors.password}
                helperText={touched.password && errors.password}
              />
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? 'Logging in…' : 'Login'}
                </Button>
                <Typography color="text.secondary" className={styles.subtle}>
                  Forgot password?
                </Typography>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
}

