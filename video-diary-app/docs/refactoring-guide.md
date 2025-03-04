# Video Diary App Refactoring Guide

This document provides practical guidance for refactoring the Video Diary App to align with best practices in React Native and Expo development.

## Common Anti-Patterns and Refactoring Solutions

### 1. Monolithic Components

**Anti-pattern:** Large components that handle multiple concerns (UI, data fetching, business logic).

**Refactoring Solution:**
```javascript
// Before: Monolithic component
function VideoEntryScreen() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Data fetching logic
  useEffect(() => {
    setLoading(true);
    fetchVideos()
      .then(data => setVideos(data))
      .finally(() => setLoading(false));
  }, []);
  
  // Business logic for filtering
  const recentVideos = videos.filter(v => {
    return new Date(v.date) > new Date(Date.now() - 86400000);
  });
  
  // Complex UI rendering
  return (/* complex JSX with many conditionals */);
}

// After: Separated concerns
// In a custom hook (hooks/useVideos.js)
function useVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    fetchVideos()
      .then(data => setVideos(data))
      .finally(() => setLoading(false));
  }, []);
  
  const recentVideos = useMemo(() => {
    return videos.filter(v => new Date(v.date) > new Date(Date.now() - 86400000));
  }, [videos]);
  
  return { videos, recentVideos, loading };
}

// In a component (screens/VideoEntry/VideoEntryScreen.js)
function VideoEntryScreen() {
  const { videos, recentVideos, loading } = useVideos();
  
  if (loading) return <LoadingIndicator />;
  
  return <VideoList videos={recentVideos} />;
}
```

### 2. Prop Drilling

**Anti-pattern:** Passing props through multiple component layers.

**Refactoring Solution:**
```javascript
// Before: Prop drilling
function App() {
  const [user, setUser] = useState(null);
  
  return (
    <MainScreen user={user} setUser={setUser} />
  );
}

function MainScreen({ user, setUser }) {
  return (
    <Sidebar user={user} setUser={setUser} />
  );
}

function Sidebar({ user, setUser }) {
  return (
    <UserProfile user={user} setUser={setUser} />
  );
}

// After: Context API
const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

function App() {
  return (
    <UserProvider>
      <MainScreen />
    </UserProvider>
  );
}

function MainScreen() {
  return <Sidebar />;
}

function Sidebar() {
  return <UserProfile />;
}

function UserProfile() {
  const { user, setUser } = useContext(UserContext);
  // Use user and setUser directly
}
```

### 3. Inconsistent Styling Approaches

**Anti-pattern:** Mixing different styling approaches (inline, StyleSheet, custom solutions).

**Refactoring Solution:**
```javascript
// Before: Mixed styling approaches
function MyComponent() {
  return (
    <View>
      <Text style={{ fontSize: 16, color: 'blue' }}>Inline style</Text>
      <Text style={styles.text}>StyleSheet style</Text>
      <Text style={customStyle}>Custom solution</Text>
    </View>
  );
}

// After: Consistent StyleSheet
function MyComponent() {
  return (
    <View style={styles.container}>
      <Text style={styles.primaryText}>Consistent styling</Text>
      <Text style={styles.secondaryText}>StyleSheet style</Text>
      <Text style={[styles.secondaryText, styles.highlighted]}>Combined styles</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  primaryText: {
    fontSize: 16,
    color: '#0066cc',
  },
  secondaryText: {
    fontSize: 14,
    color: '#333',
  },
  highlighted: {
    backgroundColor: '#fffde7',
  },
});
```

### 4. Inefficient List Rendering

**Anti-pattern:** Using ScrollView for long lists or not optimizing lists.

**Refactoring Solution:**
```javascript
// Before: Inefficient list rendering
function VideoList({ videos }) {
  return (
    <ScrollView>
      {videos.map(video => (
        <VideoItem key={video.id} video={video} />
      ))}
    </ScrollView>
  );
}

// After: Optimized list rendering
function VideoList({ videos }) {
  const renderItem = useCallback(({ item }) => {
    return <VideoItem video={item} />;
  }, []);
  
  return (
    <FlatList
      data={videos}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
    />
  );
}
```

### 5. Inline Event Handlers

**Anti-pattern:** Defining functions inside render that create new functions on each render.

**Refactoring Solution:**
```javascript
// Before: Inline event handlers
function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <View>
      <Text>{count}</Text>
      <Button 
        title="Increment" 
        onPress={() => setCount(count + 1)} 
      />
    </View>
  );
}

// After: Memoized event handlers
function Counter() {
  const [count, setCount] = useState(0);
  
  const handleIncrement = useCallback(() => {
    setCount(prevCount => prevCount + 1);
  }, []);
  
  return (
    <View>
      <Text>{count}</Text>
      <Button 
        title="Increment" 
        onPress={handleIncrement} 
      />
    </View>
  );
}
```

## Directory Structure Refactoring

### Example: Converting to Feature-Based Organization

```
Before:
app/
├── components/
│   ├── Button.js
│   ├── VideoPlayer.js
│   └── DiaryEntry.js
├── screens/
│   ├── HomeScreen.js
│   ├── RecordScreen.js
│   └── SettingsScreen.js
└── services/
    ├── api.js
    └── storage.js

After:
app/
├── common/
│   ├── components/
│   │   └── Button.js
│   └── services/
│       └── api.js
├── features/
│   ├── diary/
│   │   ├── components/
│   │   │   ├── DiaryEntry.js
│   │   │   └── VideoPlayer.js
│   │   ├── screens/
│   │   │   ├── HomeScreen.js
│   │   │   └── RecordScreen.js
│   │   └── services/
│   │       └── diaryStorage.js
│   └── settings/
│       ├── screens/
│       │   └── SettingsScreen.js
│       └── services/
│           └── settingsStorage.js
└── navigation/
    └── AppNavigator.js
```

## State Management Refactoring

### Example: Moving from Plain useState to Context API

1. **Create Context**

```javascript
// state/DiaryContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';

const DiaryContext = createContext();

export function DiaryProvider({ children }) {
  const [entries, setEntries] = useState([]);
  
  const addEntry = useCallback((entry) => {
    setEntries(prev => [...prev, entry]);
  }, []);
  
  const deleteEntry = useCallback((entryId) => {
    setEntries(prev => prev.filter(entry => entry.id !== entryId));
  }, []);
  
  return (
    <DiaryContext.Provider value={{ entries, addEntry, deleteEntry }}>
      {children}
    </DiaryContext.Provider>
  );
}

export function useDiaryEntries() {
  const context = useContext(DiaryContext);
  if (!context) {
    throw new Error('useDiaryEntries must be used within a DiaryProvider');
  }
  return context;
}
```

2. **Provide Context in App**

```javascript
// App.js
import { DiaryProvider } from './state/DiaryContext';

function App() {
  return (
    <DiaryProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </DiaryProvider>
  );
}
```

3. **Consume Context in Components**

```javascript
// screens/DiaryScreen.js
import { useDiaryEntries } from '../state/DiaryContext';

function DiaryScreen() {
  const { entries, deleteEntry } = useDiaryEntries();
  
  return (
    <FlatList
      data={entries}
      renderItem={({ item }) => (
        <DiaryEntry 
          entry={item}
          onDelete={() => deleteEntry(item.id)}
        />
      )}
    />
  );
}
```

## Gradual Refactoring Strategy

1. **Identify Priority Areas**
   - Performance bottlenecks
   - Bug-prone areas
   - Features that need expansion

2. **Establish Patterns First**
   - Create documentation of expected patterns
   - Set up linting rules
   - Create examples of correctly structured components

3. **Refactor in Phases**
   - Phase 1: Extract business logic to hooks or services
   - Phase 2: Standardize component structure
   - Phase 3: Implement proper navigation patterns
   - Phase 4: Optimize performance

4. **Testing Along the Way**
   - Write tests before refactoring
   - Ensure the same behavior is maintained
   - Document edge cases discovered during refactoring

## Conclusion

Refactoring should be an ongoing process that gradually improves code quality while maintaining functionality. By addressing these common anti-patterns and following established best practices, the Video Diary App will become more maintainable, scalable, and performant.
