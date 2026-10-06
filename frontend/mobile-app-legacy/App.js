import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const COLORS = {
  ink: '#1c302b',
  muted: '#6b7973',
  paper: '#f7f4ee',
  white: '#ffffff',
  green: '#1c5849',
  sage: '#dce8dc',
  coral: '#d86d53',
  gold: '#c8943e',
  line: '#e5e2d9',
};

const PROPERTIES = [
  { id: '1', title: 'The Grand Azure Resort', location: 'South Atoll, Maldives', category: 'Resorts', rating: '4.96', price: 32300, guests: 4, beds: 2, image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=900' },
  { id: '2', title: 'Skyline Panorama Apartment', location: 'Manhattan, New York', category: 'Apartments', rating: '4.88', price: 23800, guests: 2, beds: 1, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900' },
  { id: '3', title: 'Alpine Crest Timber Villa', location: 'Zermatt, Switzerland', category: 'Villas', rating: '4.92', price: 44200, guests: 8, beds: 4, image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?w=900' },
  { id: '4', title: 'Whispering Pines Cabin', location: 'Aspen, Colorado', category: 'Cabins', rating: '4.85', price: 16150, guests: 4, beds: 2, image: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=900' },
  { id: '5', title: 'Emerald Bay Coastal Villa', location: 'Santorini, Greece', category: 'Villas', rating: '4.94', price: 41650, guests: 6, beds: 3, image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=900' },
  { id: '6', title: 'Rosewood Meadow Cottage', location: 'Cotswolds, England', category: 'Cottages', rating: '4.79', price: 14000, guests: 3, beds: 2, image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=900' },
];
const CATEGORIES = ['All', 'Resorts', 'Apartments', 'Villas', 'Cabins', 'Cottages'];
const money = (value) => `₹${value.toLocaleString('en-IN')}`;

export default function App() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [screen, setScreen] = useState('home');
  const [selected, setSelected] = useState(null);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showBooking, setShowBooking] = useState(false);
  const [checkIn, setCheckIn] = useState('2026-10-12');
  const [checkOut, setCheckOut] = useState('2026-10-15');

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem('bh_user'),
      AsyncStorage.getItem('bh_bookings'),
      AsyncStorage.getItem('bh_favorites'),
    ]).then(([storedUser, storedBookings, storedFavorites]) => {
      setUser(storedUser ? JSON.parse(storedUser) : null);
      setBookings(storedBookings ? JSON.parse(storedBookings) : []);
      setFavorites(storedFavorites ? JSON.parse(storedFavorites) : []);
      setReady(true);
    });
  }, []);

  const persist = (key, value) => AsyncStorage.setItem(key, JSON.stringify(value));
  const toggleFavorite = (id) => {
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id];
    setFavorites(next);
    persist('bh_favorites', next);
  };
  const openDetails = (property) => { setSelected(property); setScreen('details'); };
  const submitAuth = async () => {
    if (!authEmail.trim() || !authPassword.trim() || (authMode === 'signup' && !authName.trim())) {
      Alert.alert('Missing details', 'Please complete every field to continue.');
      return;
    }
    const account = { name: authMode === 'signup' ? authName.trim() : authEmail.split('@')[0], email: authEmail.trim() };
    await persist('bh_user', account);
    setUser(account);
    setAuthPassword('');
    setScreen('home');
  };
  const createBooking = async () => {
    if (!user) { setShowBooking(false); setScreen('auth'); return; }
    const booking = { id: Date.now().toString(), propertyId: selected.id, title: selected.title, location: selected.location, image: selected.image, checkIn, checkOut, total: selected.price * 3 * 1.15, status: 'Confirmed' };
    const next = [booking, ...bookings];
    setBookings(next);
    await persist('bh_bookings', next);
    setShowBooking(false);
    setScreen('bookings');
    Alert.alert('Booking confirmed', 'Your stay has been added to booking history.');
  };
  const signOut = async () => { await AsyncStorage.removeItem('bh_user'); setUser(null); setScreen('home'); };

  if (!ready) return <View style={styles.loading}><ActivityIndicator size="large" color={COLORS.green} /></View>;
  if (screen === 'auth') return <AuthScreen mode={authMode} setMode={setAuthMode} name={authName} setName={setAuthName} email={authEmail} setEmail={setAuthEmail} password={authPassword} setPassword={setAuthPassword} submit={submitAuth} back={() => setScreen('home')} />;

  const filtered = PROPERTIES.filter((property) => (category === 'All' || property.category === category) && `${property.title} ${property.location}`.toLowerCase().includes(query.toLowerCase()));
  return <SafeAreaView style={styles.safe}><StatusBar style="dark" />
    {screen === 'details' && selected ? <DetailsScreen property={selected} favorite={favorites.includes(selected.id)} toggleFavorite={() => toggleFavorite(selected.id)} back={() => setScreen('home')} book={() => setShowBooking(true)} /> : screen === 'bookings' ? <BookingsScreen bookings={bookings} open={setSelected} back={() => setScreen('home')} /> : screen === 'profile' ? <ProfileScreen user={user} bookings={bookings} favorites={favorites} signIn={() => setScreen('auth')} signOut={signOut} /> : <HomeScreen user={user} query={query} setQuery={setQuery} category={category} setCategory={setCategory} properties={filtered} favorites={favorites} toggleFavorite={toggleFavorite} openDetails={openDetails} />}
    {screen !== 'details' && <TabBar screen={screen} setScreen={setScreen} />}
    <Modal visible={showBooking} transparent animationType="slide" onRequestClose={() => setShowBooking(false)}><BookingSheet property={selected} checkIn={checkIn} setCheckIn={setCheckIn} checkOut={checkOut} setCheckOut={setCheckOut} close={() => setShowBooking(false)} confirm={createBooking} /></Modal>
  </SafeAreaView>;
}

function HomeScreen({ user, query, setQuery, category, setCategory, properties, favorites, toggleFavorite, openDetails }) { return <ScrollView contentContainerStyle={styles.home} showsVerticalScrollIndicator={false}>
  <View style={styles.topline}><View><Text style={styles.eyebrow}>BH STAYS</Text><Text style={styles.greeting}>Find your next{user ? `, ${user.name.split(' ')[0]}` : ''} escape</Text></View><View style={styles.avatar}><Ionicons name="person" size={19} color={COLORS.green} /></View></View>
  <Text style={styles.intro}>Handpicked places for slow mornings, big views and memorable nights.</Text>
  <View style={styles.search}><Ionicons name="search" size={20} color={COLORS.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="Search destination or stay" placeholderTextColor={COLORS.muted} style={styles.searchInput} /></View>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>{CATEGORIES.map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.category, category === item && styles.categoryActive]}><Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text></Pressable>)}</ScrollView>
  <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Curated for you</Text><Text style={styles.resultCount}>{properties.length} stays</Text></View>
  <FlatList data={properties} scrollEnabled={false} keyExtractor={(item) => item.id} renderItem={({ item }) => <PropertyCard property={item} favorite={favorites.includes(item.id)} toggleFavorite={() => toggleFavorite(item.id)} open={() => openDetails(item)} />} />
</ScrollView>; }

function PropertyCard({ property, favorite, toggleFavorite, open }) { return <Pressable onPress={open} style={styles.card}><View><Image source={{ uri: property.image }} style={styles.cardImage} /><Pressable onPress={toggleFavorite} style={styles.heart}><Ionicons name={favorite ? 'heart' : 'heart-outline'} size={20} color={favorite ? COLORS.coral : COLORS.ink} /></Pressable><View style={styles.rating}><Ionicons name="star" size={12} color={COLORS.gold} /><Text style={styles.ratingText}>{property.rating}</Text></View></View><View style={styles.cardInfo}><View style={styles.cardCopy}><Text style={styles.cardTitle}>{property.title}</Text><Text style={styles.cardLocation}><Ionicons name="location-outline" size={13} /> {property.location}</Text><Text style={styles.cardMeta}>{property.category} · {property.beds} bedroom · Up to {property.guests} guests</Text></View><Text style={styles.price}>{money(property.price)}<Text style={styles.night}> / night</Text></Text></View></Pressable>; }

function DetailsScreen({ property, favorite, toggleFavorite, back, book }) { return <ScrollView showsVerticalScrollIndicator={false}><View><Image source={{ uri: property.image }} style={styles.detailImage} /><Pressable onPress={back} style={styles.backButton}><Ionicons name="arrow-back" size={22} color={COLORS.ink} /></Pressable><Pressable onPress={toggleFavorite} style={styles.detailHeart}><Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color={favorite ? COLORS.coral : COLORS.ink} /></Pressable></View><View style={styles.detailBody}><Text style={styles.detailCategory}>{property.category.toUpperCase()}</Text><Text style={styles.detailTitle}>{property.title}</Text><Text style={styles.detailLocation}><Ionicons name="location" size={16} color={COLORS.coral} /> {property.location}</Text><View style={styles.detailStats}><Stat icon="star" value={`${property.rating} rating`} /><Stat icon="bed-outline" value={`${property.beds} bedrooms`} /><Stat icon="people-outline" value={`${property.guests} guests`} /></View><Text style={styles.aboutLabel}>About this stay</Text><Text style={styles.description}>A considered retreat designed for unhurried days. Enjoy beautiful surroundings, thoughtful amenities and a warm welcome from the BH Stays team.</Text><View style={styles.bookBar}><View><Text style={styles.price}>{money(property.price)}<Text style={styles.night}> / night</Text></Text><Text style={styles.mutedSmall}>Free cancellation</Text></View><Pressable style={styles.primaryButton} onPress={book}><Text style={styles.primaryText}>Reserve stay</Text></Pressable></View></View></ScrollView>; }
function Stat({ icon, value }) { return <View style={styles.stat}><Ionicons name={icon} size={18} color={COLORS.green} /><Text style={styles.statText}>{value}</Text></View>; }

function BookingSheet({ property, checkIn, setCheckIn, checkOut, setCheckOut, close, confirm }) { return <View style={styles.modalBackdrop}><View style={styles.sheet}><View style={styles.sheetHandle} /><View style={styles.sheetHeader}><Text style={styles.sheetTitle}>Reserve your stay</Text><Pressable onPress={close}><Ionicons name="close" size={23} color={COLORS.ink} /></Pressable></View><Text style={styles.bookingProperty}>{property?.title}</Text><Text style={styles.fieldLabel}>CHECK-IN</Text><TextInput value={checkIn} onChangeText={setCheckIn} style={styles.dateInput} placeholder="YYYY-MM-DD" /><Text style={styles.fieldLabel}>CHECK-OUT</Text><TextInput value={checkOut} onChangeText={setCheckOut} style={styles.dateInput} placeholder="YYYY-MM-DD" /><View style={styles.totalRow}><Text style={styles.totalLabel}>Estimated total</Text><Text style={styles.total}>{money((property?.price || 0) * 3 * 1.15)}</Text></View><Pressable style={styles.primaryButtonWide} onPress={confirm}><Text style={styles.primaryText}>Confirm booking</Text></Pressable></View></View>; }

function BookingsScreen({ bookings, back }) { return <View style={styles.screen}><View style={styles.pageHeader}><Pressable onPress={back}><Ionicons name="arrow-back" size={22} color={COLORS.ink} /></Pressable><Text style={styles.pageTitle}>Booking history</Text><View style={{ width: 22 }} /></View>{bookings.length === 0 ? <Empty icon="calendar-outline" title="No bookings yet" body="Your confirmed stays will appear here." /> : <FlatList data={bookings} keyExtractor={(item) => item.id} contentContainerStyle={styles.bookingList} renderItem={({ item }) => <View style={styles.bookingCard}><Image source={{ uri: item.image }} style={styles.bookingImage} /><View style={styles.bookingCopy}><Text style={styles.bookingTitle}>{item.title}</Text><Text style={styles.cardLocation}>{item.location}</Text><Text style={styles.bookingDates}>{item.checkIn} → {item.checkOut}</Text><View style={styles.status}><Text style={styles.statusText}>{item.status}</Text></View></View></View>} />}</View>; }
function ProfileScreen({ user, bookings, favorites, signIn, signOut }) { return <ScrollView contentContainerStyle={styles.profile}><View style={styles.profileHero}><View style={styles.largeAvatar}><Ionicons name="person" size={34} color={COLORS.white} /></View><Text style={styles.profileName}>{user?.name || 'Welcome to BH Stays'}</Text><Text style={styles.profileEmail}>{user?.email || 'Sign in to manage your stays'}</Text>{user ? <Pressable onPress={signOut} style={styles.outlineButton}><Text style={styles.outlineText}>Sign out</Text></Pressable> : <Pressable onPress={signIn} style={styles.primaryButton}><Text style={styles.primaryText}>Sign in / Sign up</Text></Pressable>}</View><View style={styles.profileStats}><View><Text style={styles.profileStatValue}>{bookings.length}</Text><Text style={styles.profileStatLabel}>Bookings</Text></View><View><Text style={styles.profileStatValue}>{favorites.length}</Text><Text style={styles.profileStatLabel}>Saved stays</Text></View><View><Text style={styles.profileStatValue}>24/7</Text><Text style={styles.profileStatLabel}>Concierge</Text></View></View><Text style={styles.aboutLabel}>Account</Text>{['Personal details', 'Payment methods', 'Help & support'].map((item) => <View key={item} style={styles.menuRow}><Text style={styles.menuText}>{item}</Text><Ionicons name="chevron-forward" size={18} color={COLORS.muted} /></View>)}</ScrollView>; }
function Empty({ icon, title, body }) { return <View style={styles.empty}><Ionicons name={icon} size={46} color={COLORS.sage} /><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyBody}>{body}</Text></View>; }

function AuthScreen({ mode, setMode, name, setName, email, setEmail, password, setPassword, submit, back }) { return <KeyboardAvoidingView style={styles.auth} behavior={Platform.OS === 'ios' ? 'padding' : undefined}><Pressable onPress={back} style={styles.authBack}><Ionicons name="arrow-back" size={22} color={COLORS.ink} /></Pressable><View style={styles.authMark}><Ionicons name="home" size={28} color={COLORS.white} /></View><Text style={styles.authTitle}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</Text><Text style={styles.authSubtitle}>{mode === 'login' ? 'Your next beautiful stay is waiting.' : 'Join BH Stays and keep every trip together.'}</Text><View style={styles.authTabs}><Pressable onPress={() => setMode('login')} style={[styles.authTab, mode === 'login' && styles.authTabActive]}><Text style={styles.authTabText}>Sign in</Text></Pressable><Pressable onPress={() => setMode('signup')} style={[styles.authTab, mode === 'signup' && styles.authTabActive]}><Text style={styles.authTabText}>Sign up</Text></Pressable></View>{mode === 'signup' && <TextInput value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={COLORS.muted} style={styles.authInput} /> }<TextInput value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor={COLORS.muted} autoCapitalize="none" keyboardType="email-address" style={styles.authInput} /><TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={COLORS.muted} secureTextEntry style={styles.authInput} /><Pressable onPress={submit} style={styles.primaryButtonWide}><Text style={styles.primaryText}>{mode === 'login' ? 'Continue' : 'Create account'}</Text></Pressable><Text style={styles.demoNote}>Demo mode: account data is stored locally on this device.</Text></KeyboardAvoidingView>; }
function TabBar({ screen, setScreen }) { return <View style={styles.tabs}><Tab icon="search" label="Explore" active={screen === 'home'} press={() => setScreen('home')} /><Tab icon="calendar-outline" label="Bookings" active={screen === 'bookings'} press={() => setScreen('bookings')} /><Tab icon="person-outline" label="Profile" active={screen === 'profile'} press={() => setScreen('profile')} /></View>; }
function Tab({ icon, label, active, press }) { return <Pressable onPress={press} style={styles.tab}><Ionicons name={icon} size={21} color={active ? COLORS.green : COLORS.muted} /><Text style={[styles.tabText, active && styles.tabActive]}>{label}</Text></Pressable>; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.paper }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.paper }, home: { padding: 22, paddingBottom: 100 }, topline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }, eyebrow: { fontSize: 12, letterSpacing: 2.5, color: COLORS.coral, fontWeight: '800' }, greeting: { fontSize: 28, fontWeight: '700', color: COLORS.ink, marginTop: 8, maxWidth: 290 }, intro: { color: COLORS.muted, fontSize: 15, lineHeight: 22, marginTop: 12, maxWidth: 315 }, avatar: { height: 42, width: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.sage }, search: { height: 54, borderRadius: 12, backgroundColor: COLORS.white, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginTop: 24, borderWidth: 1, borderColor: COLORS.line }, searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: COLORS.ink }, categoryRow: { marginTop: 18, marginBottom: 27 }, category: { paddingHorizontal: 17, paddingVertical: 10, borderRadius: 22, backgroundColor: COLORS.white, marginRight: 8, borderWidth: 1, borderColor: COLORS.line }, categoryActive: { backgroundColor: COLORS.green, borderColor: COLORS.green }, categoryText: { color: COLORS.muted, fontWeight: '600' }, categoryTextActive: { color: COLORS.white }, sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }, sectionTitle: { fontSize: 21, color: COLORS.ink, fontWeight: '700' }, resultCount: { color: COLORS.muted, fontSize: 13 }, card: { backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden', marginBottom: 18, borderWidth: 1, borderColor: COLORS.line }, cardImage: { width: '100%', height: 190 }, heart: { position: 'absolute', top: 13, right: 13, backgroundColor: COLORS.white, width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' }, rating: { position: 'absolute', left: 13, bottom: 13, flexDirection: 'row', backgroundColor: COLORS.white, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 12, alignItems: 'center', gap: 4 }, ratingText: { color: COLORS.ink, fontSize: 12, fontWeight: '700' }, cardInfo: { padding: 15 }, cardCopy: { minHeight: 79 }, cardTitle: { color: COLORS.ink, fontSize: 17, fontWeight: '700' }, cardLocation: { color: COLORS.muted, marginTop: 6, fontSize: 13 }, cardMeta: { color: COLORS.muted, marginTop: 9, fontSize: 12 }, price: { color: COLORS.green, fontWeight: '800', fontSize: 16 }, night: { fontSize: 12, fontWeight: '400', color: COLORS.muted }, tabs: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 76, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.line, flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12 }, tab: { alignItems: 'center', gap: 4, minWidth: 80 }, tabText: { color: COLORS.muted, fontSize: 11 }, tabActive: { color: COLORS.green, fontWeight: '700' }, detailImage: { width: '100%', height: 365 }, backButton: { position: 'absolute', top: 22, left: 20, backgroundColor: COLORS.white, width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' }, detailHeart: { position: 'absolute', top: 22, right: 20, backgroundColor: COLORS.white, width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' }, detailBody: { padding: 24, paddingBottom: 40 }, detailCategory: { color: COLORS.coral, fontSize: 12, letterSpacing: 1.5, fontWeight: '800' }, detailTitle: { color: COLORS.ink, fontSize: 29, fontWeight: '700', marginTop: 10, lineHeight: 35 }, detailLocation: { color: COLORS.muted, marginTop: 10, fontSize: 14 }, detailStats: { flexDirection: 'row', gap: 14, paddingVertical: 23, borderBottomWidth: 1, borderBottomColor: COLORS.line, marginBottom: 23 }, stat: { alignItems: 'center', gap: 5, flex: 1 }, statText: { color: COLORS.muted, fontSize: 11, textAlign: 'center' }, aboutLabel: { color: COLORS.ink, fontSize: 18, fontWeight: '700', marginBottom: 8 }, description: { color: COLORS.muted, lineHeight: 23, fontSize: 14 }, bookBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 30 }, mutedSmall: { color: COLORS.muted, fontSize: 11, marginTop: 4 }, primaryButton: { backgroundColor: COLORS.coral, paddingHorizontal: 19, paddingVertical: 13, borderRadius: 10 }, primaryButtonWide: { backgroundColor: COLORS.green, paddingVertical: 16, borderRadius: 11, alignItems: 'center', marginTop: 18 }, primaryText: { color: COLORS.white, fontWeight: '700', fontSize: 15 }, modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(28,48,43,0.35)' }, sheet: { backgroundColor: COLORS.paper, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 34 }, sheetHandle: { width: 40, height: 4, borderRadius: 3, backgroundColor: COLORS.line, alignSelf: 'center', marginBottom: 19 }, sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, sheetTitle: { color: COLORS.ink, fontSize: 23, fontWeight: '700' }, bookingProperty: { color: COLORS.muted, marginTop: 7, marginBottom: 22 }, fieldLabel: { color: COLORS.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginTop: 13, marginBottom: 6 }, dateInput: { height: 48, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.line, borderRadius: 10, paddingHorizontal: 14, color: COLORS.ink }, totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, paddingTop: 17, borderTopWidth: 1, borderTopColor: COLORS.line }, totalLabel: { color: COLORS.muted }, total: { color: COLORS.green, fontSize: 18, fontWeight: '800' }, screen: { flex: 1, padding: 22, paddingBottom: 90 }, pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, marginBottom: 22 }, pageTitle: { color: COLORS.ink, fontSize: 22, fontWeight: '700' }, bookingList: { paddingBottom: 90 }, bookingCard: { backgroundColor: COLORS.white, borderRadius: 14, padding: 11, flexDirection: 'row', marginBottom: 13, borderWidth: 1, borderColor: COLORS.line }, bookingImage: { width: 92, height: 100, borderRadius: 10 }, bookingCopy: { padding: 4, paddingLeft: 13, flex: 1 }, bookingTitle: { color: COLORS.ink, fontWeight: '700', fontSize: 15 }, bookingDates: { color: COLORS.muted, marginTop: 11, fontSize: 12 }, status: { backgroundColor: COLORS.sage, alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4, marginTop: 8 }, statusText: { color: COLORS.green, fontSize: 11, fontWeight: '700' }, empty: { alignItems: 'center', marginTop: 150, paddingHorizontal: 40 }, emptyTitle: { color: COLORS.ink, fontSize: 20, fontWeight: '700', marginTop: 15 }, emptyBody: { color: COLORS.muted, textAlign: 'center', marginTop: 8, lineHeight: 20 }, profile: { padding: 22, paddingBottom: 100 }, profileHero: { alignItems: 'center', paddingTop: 36, paddingBottom: 28 }, largeAvatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: COLORS.green, alignItems: 'center', justifyContent: 'center' }, profileName: { color: COLORS.ink, fontSize: 24, fontWeight: '700', marginTop: 15 }, profileEmail: { color: COLORS.muted, marginTop: 5 }, outlineButton: { borderWidth: 1, borderColor: COLORS.line, borderRadius: 9, paddingHorizontal: 18, paddingVertical: 10, marginTop: 17 }, outlineText: { color: COLORS.green, fontWeight: '700' }, profileStats: { backgroundColor: COLORS.white, borderRadius: 14, padding: 19, flexDirection: 'row', justifyContent: 'space-around', textAlign: 'center', borderWidth: 1, borderColor: COLORS.line, marginBottom: 29 }, profileStatValue: { color: COLORS.green, textAlign: 'center', fontSize: 20, fontWeight: '800' }, profileStatLabel: { color: COLORS.muted, fontSize: 11, marginTop: 4 }, menuRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.line, paddingVertical: 18, paddingHorizontal: 14 }, menuText: { color: COLORS.ink, fontSize: 15 }, auth: { flex: 1, backgroundColor: COLORS.paper, padding: 24, justifyContent: 'center' }, authBack: { position: 'absolute', top: 62, left: 24 }, authMark: { width: 60, height: 60, backgroundColor: COLORS.green, borderRadius: 18, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 20 }, authTitle: { color: COLORS.ink, fontSize: 30, fontWeight: '700', textAlign: 'center' }, authSubtitle: { color: COLORS.muted, textAlign: 'center', lineHeight: 21, marginTop: 8, marginBottom: 26 }, authTabs: { flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 10, padding: 4, marginBottom: 17 }, authTab: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 8 }, authTabActive: { backgroundColor: COLORS.sage }, authTabText: { color: COLORS.ink, fontWeight: '700' }, authInput: { height: 53, borderWidth: 1, borderColor: COLORS.line, backgroundColor: COLORS.white, borderRadius: 10, paddingHorizontal: 15, color: COLORS.ink, marginBottom: 12, fontSize: 15 }, demoNote: { color: COLORS.muted, textAlign: 'center', fontSize: 11, lineHeight: 16, marginTop: 18 }, authBack: { position: 'absolute', top: 55, left: 24 }, authMark: { width: 60, height: 60, backgroundColor: COLORS.green, borderRadius: 18, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 20 }
});
