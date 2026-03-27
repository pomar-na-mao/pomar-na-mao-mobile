import { OccurrenceDistribution } from '@/domain/models/report-data.model';
import { ThemedText } from '@/shared/themes/themed-text';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryLabel, VictoryTheme } from 'victory-native';

const screenWidth = Dimensions.get('window').width;

interface OccurrenceDistributionChartProps {
  data: OccurrenceDistribution[];
}

export const OccurrenceDistributionChart: React.FC<OccurrenceDistributionChartProps> = ({ data }) => {
  const backgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const labelColor = useThemeColor({}, 'icon');
  const gridColor = useThemeColor({}, 'inputBorder');

  // Limiting to top 5 for better mobile display
  const chartData = data.slice(0, 5).reverse();

  if (chartData.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <ThemedText type="subtitle" style={styles.title}>Distribuição de Ocorrências</ThemedText>
        <ThemedText style={styles.noData}>Nenhuma ocorrência registrada.</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ThemedText type="subtitle" style={styles.title}>Distribuição de Ocorrências (Top 5)</ThemedText>
      <VictoryChart
        theme={VictoryTheme.material}
        domainPadding={{ x: 20, y: [0, 20] }}
        padding={{ left: 110, bottom: 40, top: 20, right: 20 }}
        width={screenWidth - 64}
        height={260}
      >
        <VictoryAxis
          dependentAxis
          tickFormat={(t) => Number.isInteger(t) ? t : ''}
          style={{
            axis: { stroke: 'none' },
            grid: { stroke: gridColor },
            tickLabels: { fontSize: 10, fill: labelColor }
          }}
        />
        <VictoryAxis
          tickLabelComponent={<VictoryLabel dx={-90} />}
          style={{
            axis: { stroke: gridColor },
            tickLabels: { fontSize: 9, fill: textColor, textAnchor: 'start' }
          }}
        />
        <VictoryBar
          horizontal
          data={chartData}
          x="name"
          y="count"
          style={{
            data: { fill: '#F59E0B', width: 24 },
            labels: { fill: '#F59E0B', fontSize: 10 }
          }}
          cornerRadius={{ top: 4, bottom: 4 }}
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
  noData: {
    textAlign: 'center',
    marginTop: 20,
    opacity: 0.6,
  }
});
