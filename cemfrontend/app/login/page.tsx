'use client';

import { TextInput, PasswordInput, Paper, Title, Container, Group, Button } from '@mantine/core';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Api from '../../api/Api';

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [authenticating, setAuthenticating] = useState<boolean>(false);

  const handleLogin = () => {
    if (!username || !password) return;

    setAuthenticating(true);
    Api.login(username, password)
      .then(() => router.push('/report'))
      .finally(() => setAuthenticating(false));
  };

  return (
    <Container size={420} my={40}>
      <Title
        align="center"
        sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900 })}
      >
        Welcome back!
      </Title>
      {/* <Text color="dimmed" size="sm" align="center" mt={5}>
        Do not have an account yet?{' '}
        <Anchor size="sm" component="button">
          Create account
        </Anchor>
      </Text> */}

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <TextInput
          label="Username"
          placeholder="Your username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          required
          mt="md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Group position="apart" mt="lg">
          {/* <Checkbox label="Remember me" /> */}
          {/* <Anchor component="button" size="sm">
            Forgot password?
          </Anchor> */}
        </Group>
        <Button
          fullWidth
          mt="xl"
          onClick={handleLogin}
          disabled={!username || !password || authenticating}
        >
          Sign in
        </Button>
      </Paper>
    </Container>
  );
}
