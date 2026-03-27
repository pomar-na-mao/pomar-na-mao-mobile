import { images } from '@/shared/constants/images';
import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { ThemedView } from '@/shared/themes/themed-view';
import { ThemedInputForm } from '@/ui/shared/components/form/input/ThemedInputForm';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, type Href } from 'expo-router';
import { useForm } from 'react-hook-form';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

interface ServiceMenu {
  route: Href;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  color?: string;
  isDisabled: boolean;
}

const schema = z.object({
  searchText: z.string(),
});

const servicesMenu: ServiceMenu[] = [
  {
    route: './syncs',
    icon: 'wifi-sync',
    title: 'Sincronizações',
    isDisabled: false,
  },
  {
    route: './reports',
    icon: 'chart-line-stacked',
    title: 'Relatórios',
    isDisabled: false,
  },
];

export default function Index() {
  const theme = useColorScheme() ?? 'light';

  const serviceIconColor = theme === 'light' ? Colors['light'].text : Colors['dark'].text;

  const { control, watch, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      searchText: '',
    },
  });

  const searchTerm = watch('searchText');

  const filteredServices = servicesMenu.filter((service) => {
    if (!searchTerm) {
      return true;
    }
    return service.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.headerWelcome}>
              <View style={[styles.logoBackground, { backgroundColor: Colors[theme].logoBackground }]}>
                <Image source={images.icon} style={styles.logo} />
              </View>
              <ThemedText type="default">Bem vindo(a)!</ThemedText>
            </View>
            <View style={styles.headerText}>
              <ThemedText type="default">Pomar na</ThemedText>
              <ThemedText
                type="default"
                style={{ fontWeight: 'bold', textDecorationLine: 'underline', color: Colors[theme].tint }}
              >
                mão
              </ThemedText>
            </View>
          </View>

          {/* Search Bar */}
          <ThemedInputForm
            control={control}
            name="searchText"
            placeholder="Pesquisar serviço ou funcionalidade..."
            keyboardType="default"
            autoCapitalize="none"
            error={formState?.errors.searchText?.message}
          />

          {/* Services */}
          <ThemedText type="defaultSemiBold" style={styles.serviceTitle}>
            Serviços
          </ThemedText>
          <View style={styles.servicesContainer}>
            {filteredServices.map((service) => (
              <TouchableOpacity
                key={String(service.route)}
                style={[
                  styles.card,
                  service.isDisabled && styles.cardDisabled,
                  { backgroundColor: Colors[theme].card },
                ]}
                activeOpacity={service.isDisabled ? 1 : 0.6}
                onPress={() => router.replace(service.route)}
                disabled={service.isDisabled}
              >
                <View style={{ borderRadius: 50, backgroundColor: Colors[theme].iconBackground, padding: 10 }}>
                  <MaterialCommunityIcons name={service.icon} size={24} color={serviceIconColor} />
                </View>
                <View style={styles.textContainer}>
                  <ThemedText type="cardInfo">{service.title}</ThemedText>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
  },
  headerContainer: {
    marginVertical: 25,
    justifyContent: 'space-between',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerWelcome: { flexDirection: 'row', gap: 6, justifyContent: 'center', alignItems: 'center' },
  logoBackground: {
    padding: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopEndRadius: 12,
    borderTopStartRadius: 6,
    borderBottomStartRadius: 12,
    borderBottomEndRadius: 6,
  },
  logo: { width: 30, height: 30 },
  headerText: { flexDirection: 'row', gap: 6 },
  searchContainer: {
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  serviceTitle: {
    marginVertical: 14,
  },
  servicesContainer: {
    gap: 12,
    flex: 1,
    justifyContent: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 170,
    height: 100,
    gap: 5,
    borderRadius: 12,
    padding: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  image: {
    width: 25,
    height: 25,
  },
  textContainer: {
    flex: 1,
  },
});
