import { AlteredPlants } from '@/domain/models/report-data.model';
import { ThemedText } from '@/shared/themes/themed-text';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryTheme } from 'victory-native';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 64;

interface AlteredPlantsChartProps {
  data: AlteredPlants[];
}

export const AlteredPlantsChart: React.FC<AlteredPlantsChartProps> = ({ data }) => {
  const backgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const labelColor = useThemeColor({}, 'icon');
  const gridColor = useThemeColor({}, 'inputBorder');

  if (data.length === 0 || data.every(d => d.count === 0)) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <ThemedText type="subtitle" style={styles.title}>Plantas Alteradas x Não Alteradas</ThemedText>
        <ThemedText style={styles.noData}>Nenhum status registrado.</ThemedText>
      </View>
    );
  }

  // Define custom colors based on status
  const chartData = data.map(d => ({
    ...d,
    fill: d.status === 'Alterada' ? '#EF4444' : '#10B981'
  }));

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ThemedText type="subtitle" style={styles.title}>Plantas Alteradas x Não Alteradas</ThemedText>
      <VictoryChart
        theme={VictoryTheme.material}
        domainPadding={{ x: 40 }}
        padding={{ left: 45, bottom: 40, top: 20, right: 30 }}
        width={chartWidth}
        height={260}
      >
        <VictoryAxis
          style={{
            axis: { stroke: gridColor },
            tickLabels: { fontSize: 10, fill: textColor }
          }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={(t) => Number.isInteger(t) ? t : ''}
          style={{
            axis: { stroke: 'none' },
            grid: { stroke: gridColor, strokeDasharray: '4, 4' },
            tickLabels: { fontSize: 10, fill: labelColor }
          }}
        />
        <VictoryBar
          data={chartData}
          x="status"
          y="count"
          style={{
            data: { fill: ({ datum }) => datum.fill, width: 36 }
          }}
          cornerRadius={{ top: 4 }}
        />
      </VictoryChart>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 32, // More bottom margin for the last item in scrollview
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    marginBottom: 8,
  },
  noData: {
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.6,
  }
});
