import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { PlusCircle, FileText, Calculator, Wrench } from 'lucide-react-native';

interface QuickAction {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  color: string;
  bgColor: string;
}

interface QuickActionsProps {
  onAddProperty?: () => void;
  onAddTenant?: () => void;
  onNewContract?: () => void;
  onCalculator?: () => void;
}

export function QuickActions({ onAddProperty, onAddTenant, onNewContract, onCalculator }: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      icon:    <PlusCircle size={22} color="#3525cd" />,
      label:   'Mülk Ekle',
      onPress: onAddProperty ?? (() => {}),
      color:   '#3525cd',
      bgColor: 'bg-brand/20',
    },
    {
      icon:    <PlusCircle size={22} color="#6d5ce7" />,
      label:   'Kiracı Ekle',
      onPress: onAddTenant ?? (() => {}),
      color:   '#6d5ce7',
      bgColor: 'bg-accent/20',
    },
    {
      icon:    <FileText size={22} color="#10b981" />,
      label:   'Sözleşme',
      onPress: onNewContract ?? (() => {}),
      color:   '#10b981',
      bgColor: 'bg-success/20',
    },
    {
      icon:    <Calculator size={22} color="#f59e0b" />,
      label:   'Hesaplayıcı',
      onPress: onCalculator ?? (() => {}),
      color:   '#f59e0b',
      bgColor: 'bg-warning/20',
    },
  ];

  return (
    <View className="flex-row gap-3">
      {actions.map((action, i) => (
        <TouchableOpacity
          key={i}
          onPress={action.onPress}
          activeOpacity={0.7}
          className="flex-1 items-center gap-2 rounded-2xl bg-surface-card border border-surface-border py-4"
        >
          <View className={`rounded-xl ${action.bgColor} p-2.5`}>
            {action.icon}
          </View>
          <Text className="text-xs font-medium text-dark-text text-center">{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
