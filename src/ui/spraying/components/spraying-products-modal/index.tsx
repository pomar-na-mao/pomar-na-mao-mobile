import type { Product } from '@/domain/models/spraying/spraying.model';
import { Colors } from '@/shared/constants/theme';
import { ThemedView } from '@/shared/themes/themed-view';
import Button from '@/ui/shared/components/Button';
import ThemedDropdown from '@/ui/shared/components/form/dropdown/ThemedDropdown';
import ThemedInput from '@/ui/shared/components/form/input/ThemedInput';
import { type SprayingProductInput, useSpraying } from '@/ui/spraying/view-models/use-spraying';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SelectedSprayingProduct extends SprayingProductInput {
  productName: string;
}

interface SprayingProductsModalProps {
  closeMenu: () => void;
}

const parseDose = (value: string) => Number(value.replace(',', '.'));

export const SprayingProductsModal: React.FC<SprayingProductsModalProps> = ({ closeMenu }) => {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const { activeProducts, handleStartSession, lastLoadedRegion, loadActiveProducts, operatorName } = useSpraying();

  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState<string | undefined>(undefined);
  const [dose, setDose] = useState('');
  const [doseUnit, setDoseUnit] = useState('ml/L');
  const [selectedProducts, setSelectedProducts] = useState<SelectedSprayingProduct[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);

  const productOptions = useMemo(
    () => activeProducts.map((product) => ({ label: product.name, value: product.id })),
    [activeProducts],
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      setIsLoadingProducts(true);
      await loadActiveProducts();

      if (mounted) {
        setIsLoadingProducts(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [loadActiveProducts]);

  const selectedProduct = useMemo<Product | undefined>(
    () => activeProducts.find((product) => product.id === selectedProductId),
    [activeProducts, selectedProductId],
  );

  const handleSelectProduct = (productId: string | number) => {
    const product = activeProducts.find((item) => item.id === String(productId));

    setSelectedProductId(String(productId));
    setDoseUnit(product?.unit ?? 'ml/L');
    setError(undefined);
  };

  const handleAddProduct = () => {
    if (!selectedProductId || !selectedProduct) {
      setError('Selecione um produto.');
      return;
    }

    const parsedDose = parseDose(dose);
    if (!Number.isFinite(parsedDose) || parsedDose <= 0) {
      setError('Informe uma dose válida.');
      return;
    }

    setSelectedProducts((current) => {
      const nextProduct: SelectedSprayingProduct = {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        dose: parsedDose,
        doseUnit: doseUnit.trim() || 'ml/L',
      };

      const exists = current.some((product) => product.productId === selectedProduct.id);
      if (exists) {
        return current.map((product) => (product.productId === selectedProduct.id ? nextProduct : product));
      }

      return [...current, nextProduct];
    });

    setSelectedProductId(undefined);
    setDose('');
    setDoseUnit('ml/L');
    setError(undefined);
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts((current) => current.filter((product) => product.productId !== productId));
  };

  const handleStart = async () => {
    if (selectedProducts.length === 0) {
      setError('Adicione pelo menos um produto.');
      return;
    }

    const started = await handleStartSession(operatorName, lastLoadedRegion, selectedProducts);

    if (started) {
      closeMenu();
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1, padding: 12 }}>
        <View style={styles.closeIconContainer}>
          <Pressable onPress={closeMenu} hitSlop={12}>
            <MaterialCommunityIcons name="close-circle" size={32} color={colors.danger} />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1, width: '100%' }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 30}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Produtos da pulverização</Text>
              <Text style={[styles.subtitle, { color: colors.disabledText }]}>
                Adicione os produtos usados antes de iniciar a sessão.
              </Text>

              <ThemedDropdown
                label="Produto"
                placeholder={
                  isLoadingProducts
                    ? 'Carregando produtos...'
                    : activeProducts.length
                      ? 'Selecione o produto'
                      : 'Nenhum produto carregado'
                }
                options={productOptions}
                value={selectedProductId}
                onSelect={handleSelectProduct}
                disabled={isLoadingProducts || activeProducts.length === 0}
              />

              <View style={styles.row}>
                <View style={styles.doseInput}>
                  <ThemedInput
                    label="Dose"
                    placeholder="0"
                    value={dose}
                    onChangeText={setDose}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.unitInput}>
                  <ThemedInput
                    label="Unidade"
                    placeholder="ml/L"
                    value={doseUnit}
                    onChangeText={setDoseUnit}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {error ? <Text style={[styles.errorText, { color: colors.errorText }]}>{error}</Text> : null}

              <Button
                variant="secondary"
                title="Adicionar produto"
                onPress={handleAddProduct}
                disabled={isLoadingProducts || activeProducts.length === 0}
              />

              <View style={styles.productsList}>
                {selectedProducts.map((product) => (
                  <View
                    key={product.productId}
                    style={[styles.productItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                  >
                    <View style={styles.productInfo}>
                      <Text style={[styles.productName, { color: colors.text }]}>{product.productName}</Text>
                      <Text style={[styles.productDose, { color: colors.disabledText }]}>
                        {product.dose} {product.doseUnit}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveProduct(product.productId)} hitSlop={12}>
                      <MaterialIcons name="delete-outline" size={24} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.actionsContainer}>
              <Button
                variant="primary"
                title="Iniciar sessão"
                onPress={handleStart}
                disabled={selectedProducts.length === 0}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  closeIconContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  doseInput: {
    flex: 1,
  },
  unitInput: {
    width: 120,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  productsList: {
    gap: 8,
    marginTop: 8,
  },
  productItem: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    padding: 12,
  },
  productInfo: {
    flex: 1,
    gap: 2,
  },
  productName: {
    fontSize: 15,
    fontWeight: '700',
  },
  productDose: {
    fontSize: 13,
  },
  actionsContainer: {
    paddingTop: 24,
  },
});
