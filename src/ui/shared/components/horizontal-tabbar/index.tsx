import { HorizontalTab } from '@/domain/models/shared/horizontal-tab.model';

import { Colors } from '@/shared/constants/theme';
import { useColorScheme } from '@/shared/hooks/use-color-scheme.web';
import { ThemedText } from '@/shared/themes/themed-text';
import { ThemedView } from '@/shared/themes/themed-view';
import React, { useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
import { styles } from './styles';

interface HorizontalTabBarProps {
  tabs: HorizontalTab[];
  onTabChange: (tab: HorizontalTab) => void;
}

const HorizontalTabBar: React.FC<HorizontalTabBarProps> = ({ tabs, onTabChange }) => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  const onTabPressHandler = (tab: HorizontalTab) => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  const theme = useColorScheme() ?? 'light';

  return (
    <ThemedView style={{ height: 50, marginBottom: 16, borderBottomWidth: 0.2, borderBottomColor: Colors[theme].icon }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          minWidth: '100%',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          gap: 12,
        }}
      >
        {tabs.map((feature) => (
          <TouchableOpacity
            key={feature.key}
            onPress={() => !feature.isDisabled && onTabPressHandler(feature)}
            disabled={feature.isDisabled}
            style={[
              styles.tabItem,
              activeTab.key === feature.key && { borderBottomColor: Colors[theme].blue },
              feature.isDisabled && styles.disabledTabItem,
            ]}
          >
            <ThemedText
              type="tabItem"
              style={[
                activeTab.key === feature.key && { color: Colors[theme].blue },
                feature.isDisabled && { color: Colors[theme].icon },
              ]}
            >
              {feature.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ThemedView>
  );
};

export default HorizontalTabBar;
