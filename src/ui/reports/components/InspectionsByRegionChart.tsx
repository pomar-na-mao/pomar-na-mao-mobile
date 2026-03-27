import { InspectionsByRegion } from '@/domain/models/report-data.model';
import { ThemedText } from '@/shared/themes/themed-text';
import { useThemeColor } from '@/shared/hooks/use-theme-color';
import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryTheme } from 'victory-native';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 64;

interface InspectionsByRegionChartProps {
  data: InspectionsByRegion[];
}

export const InspectionsByRegionChart: React.FC<InspectionsByRegionChartProps> = ({ data }) => {
  const backgroundColor = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');
  const labelColor = useThemeColor({}, 'icon');
  const gridColor = useThemeColor({}, 'inputBorder');

  if (data.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor }]}>
        <ThemedText type="subtitle" style={styles.title}>Inspeções por Região</ThemedText>
        <ThemedText style={styles.noData}>Nenhuma inspeção registrada.</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ThemedText type="subtitle" style={styles.title}>Inspeções por Região</ThemedText>
      <VictoryChart
        theme={VictoryTheme.material}
        domainPadding={{ x: 20 }}
        padding={{ left: 45, bottom: 50, top: 20, right: 30 }}
        width={chartWidth}
        height={260}
      >
        <VictoryAxis
          style={{
            axis: { stroke: gridColor },
            tickLabels: { fontSize: 9, fill: textColor, angle: data.length > 4 ? -45 : 0, textAnchor: data.length > 4 ? 'end' : 'middle' }
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
          data={data}
          x="region"
          y="count"
          style={{
            data: { fill: '#3B82F6', width: 24 },
            labels: { fill: '#3B82F6', fontSize: 10 }
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
