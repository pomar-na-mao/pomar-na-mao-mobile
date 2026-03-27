import { PlantsByRegion } from '@/domain/models/report-data.model';
import { ThemedText } from '@/shared/themes/themed-text';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { VictoryPie } from 'victory-native';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 64;

interface PlantsByRegionChartProps {
  data: PlantsByRegion[];
}

export const PlantsByRegionChart: React.FC<PlantsByRegionChartProps> = ({ data }) => {
  const backgroundColor = useThemeColor({}, 'card');

  if (data.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <ThemedText type="subtitle" style={styles.title}>Plantas por Região</ThemedText>
        <ThemedText style={styles.noData}>Nenhuma planta registrada.</ThemedText>
      </View>
    );
  }

  const chartData = data.map(d => ({
    x: d.region,
    y: d.count
  }));

  const colorScale = [
    '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'
  ];

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ThemedText type="subtitle" style={styles.title}>Plantas por Região</ThemedText>
      <View style={styles.chartContainer}>
        <VictoryPie
          width={chartWidth}
          height={300}
          data={chartData}
          colorScale={colorScale}
          innerRadius={65}
          labelRadius={({ innerRadius }: { innerRadius?: number | ((props: any) => number) }) => 
            (typeof innerRadius === 'number' ? innerRadius + 25 : 90)}
          style={{
            labels: { fill: 'white', fontSize: 11, fontWeight: 'bold' }
          }}
          padding={{ top: 20, bottom: 20, left: 20, right: 20 }}
        />
        <View style={styles.centerLabel}>
          <ThemedText style={styles.centerText}>Regiões</ThemedText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    marginBottom: 8,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.5,
  },
  noData: {
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.6,
  }
});
