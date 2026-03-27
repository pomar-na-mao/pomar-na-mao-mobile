import { ThemedText } from '@/shared/themes/themed-text';
import { ThemedView } from '@/shared/themes/themed-view';
import { useAuth } from '@/ui/auth/view-models/useAuth';
import Button from '@/ui/shared/components/Button';
import { ThemedInputForm } from '@/ui/shared/components/form/input/ThemedInputForm';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Image, KeyboardAvoidingView, Platform, TouchableOpacity, View } from 'react-native';
import { z } from 'zod';

import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import { authStyles } from '@/shared/styles/auth-styles';
import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const schema = z.object({
  email: z
    .string({
      error: 'O email é obrigatório!',
    })
    .nonempty('O email é obrigatório!'),
});

export const ForgotPasswordView = () => {
  const { resetPassword } = useAuth();
  const { isLoading } = useLoadingStore();
  const theme = useColorScheme() ?? 'light';

  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: { email: string }) => {
    const { email } = data;
    await resetPassword(email);
  };

  const cardBackgroundColor = theme === 'dark' ? Colors.dark.card : Colors.light.card;

  return (
    <ThemedView style={authStyles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={authStyles.content}>
          {/* Logo */}
          <View style={authStyles.logoContainer}>
            <Image source={require('@/assets/images/icon.png')} style={authStyles.logo} />
          </View>

          {/* Card Container for Form */}
          <View style={[authStyles.cardContainer, { backgroundColor: cardBackgroundColor }]}>
            {/* Header */}
            <View style={authStyles.header}>
              <ThemedText type="title" style={authStyles.title}>
                Lembrar senha
              </ThemedText>
              <ThemedText type="subtitle" style={authStyles.subtitle}>
                Digite seu e-mail para enviar um link de recuperação
              </ThemedText>
            </View>

            {/* Form */}
            <View style={authStyles.form}>
              <ThemedInputForm
                control={control}
                name="email"
                label="Email"
                placeholder="Digite seu email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={formState?.errors.email?.message}
              />

              <TouchableOpacity style={authStyles.link} onPress={() => router.replace('/(auth)/login')}>
                <ThemedText type="link">Voltar para o Login</ThemedText>
              </TouchableOpacity>

              <Button
                style={{ marginTop: 18 }}
                isLoading={isLoading}
                title="Recuperar"
                onPress={handleSubmit(onSubmit)}
              />

              <TouchableOpacity style={authStyles.fieldWorksButton} onPress={() => router.replace('/field-works')}>
                <ThemedText type="default" style={{ fontSize: 14 }}>
                  Trabalho em campo
                </ThemedText>
                <ThemedText type="link" style={{ fontSize: 14, marginLeft: 4 }}>
                  acesse aqui
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
};
