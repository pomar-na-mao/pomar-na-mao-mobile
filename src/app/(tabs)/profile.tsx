/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { useLoadingStore } from '@/shared/hooks/use-loading';
import { ThemedText } from '@/shared/themes/themed-text';
import { ThemedView } from '@/shared/themes/themed-view';
import { useAuth } from '@/ui/auth/view-models/useAuth';
import UserProfileInfos from '@/ui/shared/components/user-profile-infos';
import { useUserData } from '@/ui/shared/hooks/use-user';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
  const currentYear = new Date().getFullYear();

  const { setIsLoading } = useLoadingStore();

  const { user, signOut } = useAuth();

  const { isLoading: isLoadingUserData, data: userData } = useUserData(user?.id!);

  useEffect(() => {
    setIsLoading(isLoadingUserData);
  }, [isLoadingUserData, setIsLoading]);

  const handleSignOut = async () => {
    await signOut();
  };

  const theme = useColorScheme() ?? 'light';

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1 }}>
        <UserProfileInfos name={userData?.full_name} avatarUrl={userData?.avatar_url} email={userData?.email} />
        <View style={styles.settingsWrapper}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View>
              <TouchableOpacity style={styles.itemContainer}>
                <MaterialCommunityIcons name="history" size={26} color={Colors[theme].blue} />
                <ThemedText type="default" style={styles.label}>
                  Histórico
                </ThemedText>
                <Ionicons name="chevron-forward-outline" size={22} color={Colors[theme].icon} />
              </TouchableOpacity>
              <View style={styles.separator} />
            </View>
            <View>
              <TouchableOpacity style={styles.itemContainer}>
                <Ionicons name="notifications-outline" size={26} color={Colors[theme].blue} />
                <ThemedText type="default" style={styles.label}>
                  Notificações
                </ThemedText>
                <Ionicons name="chevron-forward-outline" size={22} color={Colors[theme].icon} />
              </TouchableOpacity>
              <View style={styles.separator} />
            </View>
            {/* Segurança */}
            <View>
              <TouchableOpacity style={styles.itemContainer}>
                <MaterialCommunityIcons name="security" size={26} color={Colors[theme].blue} />
                <ThemedText type="default" style={styles.label}>
                  Segurança
                </ThemedText>
                <Ionicons name="chevron-forward-outline" size={22} color={Colors[theme].icon} />
              </TouchableOpacity>
              <View style={styles.separator} />
            </View>
            {/* Ajuda e suporte */}
            <View>
              <TouchableOpacity style={styles.itemContainer}>
                <MaterialCommunityIcons name="help-circle-outline" size={26} color={Colors[theme].blue} />
                <ThemedText type="default" style={styles.label}>
                  Ajuda e suporte
                </ThemedText>
                <Ionicons name="chevron-forward-outline" size={22} color={Colors[theme].icon} />
              </TouchableOpacity>
              <View style={styles.separator} />
            </View>
            {/* Termos */}
            <View>
              <TouchableOpacity style={styles.itemContainer}>
                <FontAwesome name="wpforms" size={26} color={Colors[theme].blue} />
                <ThemedText type="default" style={styles.label}>
                  Termos
                </ThemedText>
                <Ionicons name="chevron-forward-outline" size={22} color={Colors[theme].icon} />
              </TouchableOpacity>
              <View style={styles.separator} />
            </View>
            {/* Configurações */}
            <View>
              <TouchableOpacity style={styles.itemContainer}>
                <Ionicons name="settings" size={26} color={Colors[theme].blue} />
                <ThemedText type="default" style={styles.label}>
                  Configurações
                </ThemedText>
                <Ionicons name="chevron-forward-outline" size={22} color={Colors[theme].icon} />
              </TouchableOpacity>
              <View style={styles.separator} />
            </View>
            {/* Sair */}
            <View>
              <TouchableOpacity style={styles.itemContainer} onPress={handleSignOut}>
                <Ionicons name="log-out-outline" size={26} color={Colors[theme].danger} />
                <ThemedText type="default" style={styles.label}>
                  Sair
                </ThemedText>
                <Ionicons name="chevron-forward-outline" size={22} color={Colors[theme].icon} />
              </TouchableOpacity>
            </View>

            <ThemedText type="subtitle" style={{ marginTop: 10 }}>
              Versão do app 3.0.0 ({currentYear})
            </ThemedText>
          </ScrollView>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  settingsWrapper: {
    marginHorizontal: 16,
    paddingBottom: 20,
    marginTop: 2,
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 80,
  },
  iconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  label: {
    flex: 1,
    marginLeft: 8,
  },
  separator: {
    marginHorizontal: 12,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#C6C6C8',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#A0A0A0',
    marginTop: 10,
  },
  logoutContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 10,
    paddingRight: 10,
  },
});
