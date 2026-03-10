import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { transactionsAPI } from '../../api/transactions';

const FinancialAnalysisScreen = () => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const handleGenerate = async () => {
    console.log('Generate button clicked');
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await transactionsAPI.getFinancialAnalysis(fromDate, toDate);
      console.log('API response received:', response);
      const data = response.data;
      
      if (data?.message?.toLowerCase().includes('not enough data')) {
        setError('We need more financial data to generate insights. Please track more expenses (minimum 10 transactions and 1 month of data) and try again.');
      } else {
        setAnalysis(data);
      }
    } catch (err) {
      console.error('Error fetching financial analysis', err);
      const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || 'Analysis service temporarily unavailable. Please try again later.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>Financial Analysis</Text>

          {/* Date Range Pickers */}
          <View style={styles.dateRangeContainer}>
            <View style={styles.dateInputGroup}>
              <Text style={styles.dateLabel}>From date</Text>
              <TextInput
                style={styles.dateInput}
                value={fromDate}
                onChangeText={setFromDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View style={styles.dateInputGroup}>
              <Text style={styles.dateLabel}>To date</Text>
              <TextInput
                style={styles.dateInput}
                value={toDate}
                onChangeText={setToDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
          <Text style={styles.dateHint}>
            Optional: Leave empty to use default range (last 6 months)
          </Text>

          {/* Generate Button */}
          {!analysis && !error && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.generateButton, loading && styles.buttonDisabled]}
                onPress={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.generateButtonText}>Generate Financial Analysis</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Loading State */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#60a5fa" />
              <Text style={styles.loadingText}>Generating your financial analysis…</Text>
            </View>
          )}

          {/* Error State */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={[styles.retryButton, loading && styles.buttonDisabled]}
                onPress={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text style={styles.retryButtonText}>Try Again</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Analysis Results */}
          {analysis && (
            <View style={styles.resultsContainer}>
              {/* Financial Health */}
              {analysis.analysis && (
                <View style={styles.healthContainer}>
                  <Text style={styles.healthTitle}>Financial Health</Text>
                  <Text style={styles.healthText}>{analysis.analysis}</Text>
                </View>
              )}

              {/* Warnings */}
              {Array.isArray(analysis.warnings) && analysis.warnings.length > 0 && (
                <View style={styles.warningsContainer}>
                  <Text style={styles.warningsTitle}>Warnings</Text>
                  {analysis.warnings.map((warning, idx) => (
                    <View key={idx} style={styles.warningItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.warningText}>{warning}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Suggestions */}
              {Array.isArray(analysis.suggestions) && analysis.suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  <Text style={styles.suggestionsTitle}>Suggestions</Text>
                  {analysis.suggestions.map((suggestion, idx) => (
                    <View key={idx} style={styles.suggestionItem}>
                      <Text style={styles.bullet}>•</Text>
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Regenerate Button */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.regenerateButton, loading && styles.buttonDisabled]}
                  onPress={handleGenerate}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Text style={styles.regenerateButtonText}>Regenerate</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  dateRangeContainer: {
    marginBottom: 8,
  },
  dateInputGroup: {
    marginBottom: 12,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#ffffff',
    color: '#1f2937',
  },
  dateHint: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  generateButton: {
    backgroundColor: '#60a5fa',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    backgroundColor: '#d1d5db',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 12,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#60a5fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
  },
  resultsContainer: {
    gap: 16,
  },
  healthContainer: {
    padding: 16,
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#6ee7b7',
    borderRadius: 8,
  },
  healthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 8,
  },
  healthText: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
  warningsContainer: {
    padding: 16,
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 8,
    marginTop: 16,
  },
  warningsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 8,
  },
  warningItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#b91c1c',
    flex: 1,
    marginLeft: 8,
  },
  suggestionsContainer: {
    padding: 16,
    backgroundColor: '#dbeafe',
    borderWidth: 1,
    borderColor: '#93c5fd',
    borderRadius: 8,
    marginTop: 16,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 14,
    color: '#1d4ed8',
    flex: 1,
    marginLeft: 8,
  },
  bullet: {
    fontSize: 14,
    color: '#1f2937',
  },
  regenerateButton: {
    backgroundColor: '#60a5fa',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  regenerateButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default FinancialAnalysisScreen;
