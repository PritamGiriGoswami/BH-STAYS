import React, { useState } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const colors = {
  ink: '#16211E',
  muted: '#72807A',
  sage: '#A8B8A1',
  deepSage: '#38564B',
  cream: '#F7F5F0',
  paper: '#FFFFFF',
  line: '#E5E7E1',
  coral: '#E9866C',
  paleSage: '#E8EEE7',
};

type Screen = 'home' | 'bookings' | 'profile';
type Property = {
  id: string;
  name: string;
  city: string;
  area: string;
  price: number;
  rating: number;
  image: string;
  category: string;
  description: string;
  tags: string[];
};

type Booking = Property & { date: string; guests: number; status: 'Upcoming' | 'Completed' };

const properties: Property[] = [
  {
    id: 'p1', name: 'Cedar & Stone Cabin', city: 'Kodaikanal', area: 'Tamil Nadu', price: 6800, rating: 4.92,
    image: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=1200&q=85', category: 'Cabins',
    description: 'A quiet cedar cabin tucked into the misty hills, with a wood-fired kitchen and views that reward slow mornings.', tags: ['Mountain view', 'Fireplace', 'Entire home'],
  },
  {
    id: 'p2', name: 'The Palm House', city: 'Alibaug', area: 'Maharashtra', price: 9200, rating: 4.88,
    image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=85', category: 'Villas',
    description: 'An airy coastal home made for long lunches, barefoot evenings, and a proper dip in the private pool.', tags: ['Private pool', 'Kitchen', 'Pet friendly'],
  },
  {
    id: 'p3', name: 'Moss & Morning', city: 'Coorg', area: 'Karnataka', price: 5400, rating: 4.96,
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=85', category: 'Cottages',
    description: 'Wake up to birdsong and coffee grown just down the road in this intimate cottage surrounded by rainforest.', tags: ['Garden', 'Breakfast included', 'Workspace'],
  },
];

const initialBooking: Booking = { ...properties[1], date: '24 - 27 Oct 2025', guests: 2, status: 'Upcoming' };

function Icon({ name, size = 22, color = colors.ink }: { name: keyof typeof Ionicons.glyphMap; size?: number; color?: string }) {
  return <Ionicons name={name} size={size} color={color} />;
}

function BrandMark() {
  return <View style={styles.brandMark}><View style={styles.brandLeaf} /><View style={styles.brandStem} /></View>;
}

function AuthScreen({ onEnter }: { onEnter: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  return (
    <SafeAreaView style={styles.authScreen}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.authContent} keyboardShouldPersistTaps="handled">
        <View style={styles.authLogo}><BrandMark /><Text style={styles.logoText}>bh stays</Text></View>
        <View style={styles.authHero}>
          <Text style={styles.eyebrow}>STAY A LITTLE CLOSER</Text>
          <Text style={styles.authTitle}>Find a place{`\n`}that feels like you.</Text>
          <Text style={styles.authSub}>Thoughtful homes, warm hosts, and room to breathe.</Text>
        </View>
        <View style={styles.authCard}>
          <View style={styles.segmented}>
            <Pressable onPress={() => setMode('login')} style={[styles.segment, mode === 'login' && styles.segmentActive]}><Text style={[styles.segmentText, mode === 'login' && styles.segmentTextActive]}>Log in</Text></Pressable>
            <Pressable onPress={() => setMode('signup')} style={[styles.segment, mode === 'signup' && styles.segmentActive]}><Text style={[styles.segmentText, mode === 'signup' && styles.segmentTextActive]}>Create account</Text></Pressable>
          </View>
          {mode === 'signup' && <TextInput placeholder="Full name" placeholderTextColor={colors.muted} style={styles.input} />}
          <TextInput value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor={colors.muted} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
          <TextInput placeholder="Password" placeholderTextColor={colors.muted} secureTextEntry style={styles.input} />
          <Pressable onPress={onEnter} style={styles.primaryButton}><Text style={styles.primaryButtonText}>{mode === 'login' ? 'Log in' : 'Create account'}</Text><Icon name="arrow-forward" size={18} color={colors.paper} /></Pressable>
          <Pressable onPress={onEnter}><Text style={styles.guestLink}>Continue as guest</Text></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return <View style={styles.header}><View><Text style={styles.headerTitle}>{title}</Text>{subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}</View><View style={styles.avatar}><Text style={styles.avatarText}>AS</Text></View></View>;
}

function HomeScreen({ onSelect }: { onSelect: (property: Property) => void }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All stays');
  const filtered = properties.filter((property) => {
    const matchesQuery = `${property.name} ${property.city} ${property.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === 'All stays' || property.category === category;
    return matchesQuery && matchesCategory;
  });
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
      <Header title="Good morning, Aanya" subtitle="Where are you off to?" />
      <View style={styles.searchBox}><Icon name="search" size={20} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="Search stays or destinations" placeholderTextColor={colors.muted} style={styles.searchInput} /><Pressable style={styles.filterButton}><Icon name="options-outline" size={19} color={colors.paper} /></Pressable></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
        {['All stays', 'Cabins', 'Villas', 'Cottages'].map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.categoryChip, category === item && styles.categoryChipActive]}><Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>{item}</Text></Pressable>)}
      </ScrollView>
      <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Made for your next escape</Text><Pressable onPress={() => { setCategory('All stays'); setQuery(''); }}><Text style={styles.linkText}>See all</Text></Pressable></View>
      {filtered.map((property) => <PropertyCard key={property.id} property={property} onPress={() => onSelect(property)} />)}
      {filtered.length === 0 && <Text style={styles.emptyText}>No stays found. Try another place.</Text>}
    </ScrollView>
  );
}

function PropertyCard({ property, onPress }: { property: Property; onPress: () => void }) {
  const [favorite, setFavorite] = useState(false);
  return <Pressable onPress={onPress} style={styles.propertyCard}><View><Image source={{ uri: property.image }} style={styles.propertyImage} /><View style={styles.imageBadge}><Icon name="star" size={13} color={colors.deepSage} /><Text style={styles.imageBadgeText}>{property.rating}</Text></View><Pressable onPress={() => setFavorite((current) => !current)} style={styles.heart}><Icon name={favorite ? 'heart' : 'heart-outline'} size={20} color={favorite ? colors.coral : colors.paper} /></Pressable></View><View style={styles.propertyInfo}><View><Text style={styles.propertyName}>{property.name}</Text><Text style={styles.propertyLocation}>{property.city} · {property.area}</Text></View><Text style={styles.price}>₹{property.price.toLocaleString('en-IN')} <Text style={styles.perNight}>/ night</Text></Text></View></Pressable>;
}

function DetailScreen({ property, onBack, onBook }: { property: Property; onBack: () => void; onBook: () => void }) {
  return <View style={styles.detailScreen}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailContent}><View><Image source={{ uri: property.image }} style={styles.detailImage} /><Pressable onPress={onBack} style={styles.backButton}><Icon name="arrow-back" size={20} color={colors.ink} /></Pressable><Pressable style={styles.detailHeart}><Icon name="heart-outline" size={21} color={colors.ink} /></Pressable></View><View style={styles.detailBody}><View style={styles.detailTitleRow}><View><Text style={styles.detailName}>{property.name}</Text><Text style={styles.detailLocation}>{property.city}, {property.area}</Text></View><View style={styles.ratingBlock}><Icon name="star" size={15} color={colors.coral} /><Text style={styles.ratingText}>{property.rating}</Text></View></View><View style={styles.tagRow}>{property.tags.map((tag) => <View style={styles.tag} key={tag}><Text style={styles.tagText}>{tag}</Text></View>)}</View><View style={styles.rule} /><Text style={styles.detailDescription}>{property.description}</Text><View style={styles.hostRow}><View style={styles.hostAvatar}><Text style={styles.hostAvatarText}>RK</Text></View><View><Text style={styles.hostTitle}>Hosted by Rohan & Kavya</Text><Text style={styles.hostMeta}>Superhost · Responds within an hour</Text></View></View></View></ScrollView><View style={styles.bottomBar}><View><Text style={styles.bottomPrice}>₹{property.price.toLocaleString('en-IN')} <Text style={styles.perNight}>/ night</Text></Text><Text style={styles.bottomMeta}>Free cancellation</Text></View><Pressable onPress={onBook} style={styles.reserveButton}><Text style={styles.reserveText}>Reserve</Text><Icon name="arrow-forward" size={18} color={colors.paper} /></Pressable></View></View>;
}

function BookingScreen({ property, onBack, onConfirm }: { property: Property; onBack: () => void; onConfirm: (booking: Booking) => void }) {
  const [guests, setGuests] = useState(2);
  const [date, setDate] = useState('24 - 27 Oct 2025');
  return <SafeAreaView style={styles.screen}><ScrollView contentContainerStyle={styles.bookingContent}><View style={styles.bookingHeader}><Pressable onPress={onBack} style={styles.roundButton}><Icon name="arrow-back" size={20} color={colors.ink} /></Pressable><Text style={styles.bookingTitle}>Your stay</Text><View style={{ width: 40 }} /></View><Image source={{ uri: property.image }} style={styles.bookingImage} /><Text style={styles.detailName}>{property.name}</Text><Text style={styles.detailLocation}>{property.city}, {property.area}</Text><View style={styles.rule} /><Text style={styles.formLabel}>DATES</Text><Pressable style={styles.formRow} onPress={() => setDate(date === '24 - 27 Oct 2025' ? '31 Oct - 03 Nov 2025' : '24 - 27 Oct 2025')}><View style={styles.formIcon}><Icon name="calendar-outline" size={19} color={colors.deepSage} /></View><View><Text style={styles.formValue}>{date}</Text><Text style={styles.formHint}>Check-in to check-out</Text></View><Icon name="chevron-forward" size={19} color={colors.muted} /></Pressable><Text style={styles.formLabel}>GUESTS</Text><View style={styles.formRow}><View style={styles.formIcon}><Icon name="people-outline" size={19} color={colors.deepSage} /></View><View style={styles.guestCopy}><Text style={styles.formValue}>{guests} guests</Text><Text style={styles.formHint}>Up to 4 guests</Text></View><Pressable onPress={() => setGuests(Math.max(1, guests - 1))} style={styles.stepper}><Text style={styles.stepText}>−</Text></Pressable><Text style={styles.guestCount}>{guests}</Text><Pressable onPress={() => setGuests(Math.min(4, guests + 1))} style={styles.stepper}><Text style={styles.stepText}>+</Text></Pressable></View><View style={styles.priceSummary}><View><Text style={styles.summaryText}>₹{property.price.toLocaleString('en-IN')} x 3 nights</Text><Text style={styles.summaryText}>Cleaning fee</Text><Text style={styles.totalLabel}>Total</Text></View><View style={styles.summaryRight}><Text style={styles.summaryText}>₹{(property.price * 3).toLocaleString('en-IN')}</Text><Text style={styles.summaryText}>₹600</Text><Text style={styles.totalValue}>₹{(property.price * 3 + 600).toLocaleString('en-IN')}</Text></View></View><Pressable onPress={() => onConfirm({ ...property, date, guests, status: 'Upcoming' })} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Confirm booking</Text><Icon name="checkmark" size={18} color={colors.paper} /></Pressable></ScrollView></SafeAreaView>;
}

function BookingsScreen({ bookings, onSelect }: { bookings: Booking[]; onSelect: (property: Property) => void }) {
  return <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}><Header title="Your bookings" subtitle="All your stays in one place" />{bookings.length === 0 ? <View style={styles.emptyState}><View style={styles.emptyIcon}><Icon name="calendar-outline" size={28} color={colors.deepSage} /></View><Text style={styles.emptyTitle}>Nothing booked yet</Text><Text style={styles.emptyCopy}>Your next slow morning is waiting to be planned.</Text></View> : bookings.map((booking) => <Pressable key={booking.id} onPress={() => onSelect(booking)} style={styles.bookingCard}><Image source={{ uri: booking.image }} style={styles.bookingThumb} /><View style={styles.bookingCardInfo}><View style={styles.bookingStatus}><Text style={styles.bookingStatusText}>{booking.status}</Text></View><Text style={styles.bookingCardName}>{booking.name}</Text><Text style={styles.bookingCardMeta}>{booking.date} · {booking.guests} guests</Text><Text style={styles.bookingPrice}>₹{booking.price.toLocaleString('en-IN')} <Text style={styles.perNight}>/ night</Text></Text></View><Icon name="chevron-forward" size={19} color={colors.muted} /></Pressable>)}</ScrollView>;
}

function ProfileScreen({ onSignOut }: { onSignOut: () => void }) {
  return <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}><Header title="Your profile" subtitle="Make yourself at home" /><View style={styles.profileHero}><View style={styles.profileAvatar}><Text style={styles.profileAvatarText}>AS</Text></View><Text style={styles.profileName}>Aanya Sharma</Text><Text style={styles.profileEmail}>aanya.sharma@email.com</Text><Pressable style={styles.editButton}><Icon name="pencil-outline" size={15} color={colors.deepSage} /><Text style={styles.editText}>Edit profile</Text></Pressable></View><View style={styles.profileMenu}>{[['person-outline', 'Personal information'], ['card-outline', 'Payment methods'], ['notifications-outline', 'Notifications'], ['help-circle-outline', 'Help & support']].map(([icon, label]) => <Pressable style={styles.menuRow} key={label}><View style={styles.menuIcon}><Icon name={icon as keyof typeof Ionicons.glyphMap} size={20} color={colors.deepSage} /></View><Text style={styles.menuText}>{label}</Text><Icon name="chevron-forward" size={18} color={colors.muted} /></Pressable>)}<View style={styles.rule} /><Pressable onPress={onSignOut} style={styles.menuRow}><View style={[styles.menuIcon, { backgroundColor: '#FCEBE7' }]}><Icon name="log-out-outline" size={20} color={colors.coral} /></View><Text style={[styles.menuText, { color: colors.coral }]}>Log out</Text></Pressable></View><Text style={styles.version}>BH STAYS · VERSION 1.0.0</Text></ScrollView>;
}

function TabBar({ screen, setScreen }: { screen: Screen; setScreen: (screen: Screen) => void }) {
  const tabs: { key: Screen; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [{ key: 'home', label: 'Explore', icon: 'compass-outline' }, { key: 'bookings', label: 'Bookings', icon: 'calendar-outline' }, { key: 'profile', label: 'Profile', icon: 'person-outline' }];
  return <View style={styles.tabBar}>{tabs.map((tab) => <Pressable key={tab.key} onPress={() => setScreen(tab.key)} style={styles.tab}><Icon name={tab.icon} size={23} color={screen === tab.key ? colors.deepSage : colors.muted} /><Text style={[styles.tabLabel, screen === tab.key && styles.tabLabelActive]}>{tab.label}</Text></Pressable>)}</View>;
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [screen, setScreen] = useState<Screen>('home');
  const [selected, setSelected] = useState<Property | null>(null);
  const [bookingMode, setBookingMode] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([initialBooking]);
  if (!authenticated) return <AuthScreen onEnter={() => setAuthenticated(true)} />;
  if (bookingMode && selected) return <BookingScreen property={selected} onBack={() => setBookingMode(false)} onConfirm={(booking) => { setBookings((current) => [booking, ...current]); setBookingMode(false); setSelected(null); setScreen('bookings'); }} />;
  if (selected) return <DetailScreen property={selected} onBack={() => setSelected(null)} onBook={() => setBookingMode(true)} />;
  return <SafeAreaView style={styles.app}><StatusBar barStyle="dark-content" /><View style={styles.main}>{screen === 'home' && <HomeScreen onSelect={setSelected} />}{screen === 'bookings' && <BookingsScreen bookings={bookings} onSelect={setSelected} />}{screen === 'profile' && <ProfileScreen onSignOut={() => setAuthenticated(false)} />}</View><TabBar screen={screen} setScreen={setScreen} /></SafeAreaView>;
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.cream }, main: { flex: 1 }, screen: { flex: 1, backgroundColor: colors.cream }, screenContent: { padding: 24, paddingBottom: 36 },
  authScreen: { flex: 1, backgroundColor: colors.cream }, authContent: { padding: 26, paddingTop: 34, paddingBottom: 30 }, authLogo: { flexDirection: 'row', alignItems: 'center', gap: 9 }, logoText: { fontSize: 21, fontWeight: '700', color: colors.ink, letterSpacing: -0.5 }, brandMark: { width: 25, height: 25, position: 'relative' }, brandLeaf: { position: 'absolute', width: 17, height: 24, borderTopLeftRadius: 18, borderBottomRightRadius: 18, backgroundColor: colors.deepSage, transform: [{ rotate: '35deg' }], left: 2, top: 0 }, brandStem: { width: 2, height: 20, backgroundColor: colors.coral, position: 'absolute', left: 13, top: 7, transform: [{ rotate: '28deg' }] },
  authHero: { marginTop: 83, marginBottom: 34 }, eyebrow: { color: colors.coral, fontSize: 11, fontWeight: '800', letterSpacing: 2 }, authTitle: { color: colors.ink, fontSize: 42, lineHeight: 46, fontWeight: '700', marginTop: 13, letterSpacing: -1.5 }, authSub: { color: colors.muted, fontSize: 16, lineHeight: 23, marginTop: 17, maxWidth: 280 }, authCard: { backgroundColor: colors.paper, borderRadius: 22, padding: 19, shadowColor: '#1A2B23', shadowOpacity: 0.07, shadowRadius: 18, elevation: 3 }, segmented: { backgroundColor: colors.cream, borderRadius: 12, flexDirection: 'row', padding: 4, marginBottom: 17 }, segment: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 9 }, segmentActive: { backgroundColor: colors.paper, shadowColor: '#1A2B23', shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 }, segmentText: { color: colors.muted, fontSize: 13, fontWeight: '600' }, segmentTextActive: { color: colors.deepSage }, input: { backgroundColor: colors.cream, borderRadius: 11, height: 50, paddingHorizontal: 15, marginBottom: 11, color: colors.ink, fontSize: 14 }, primaryButton: { backgroundColor: colors.deepSage, minHeight: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 12, marginTop: 5 }, primaryButtonText: { color: colors.paper, fontSize: 15, fontWeight: '700' }, guestLink: { textAlign: 'center', color: colors.deepSage, fontSize: 13, fontWeight: '700', paddingTop: 18, paddingBottom: 2 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 23 }, headerTitle: { fontSize: 27, fontWeight: '700', letterSpacing: -0.6, color: colors.ink }, headerSubtitle: { color: colors.muted, marginTop: 5, fontSize: 14 }, avatar: { backgroundColor: colors.coral, width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' }, avatarText: { color: colors.paper, fontSize: 12, fontWeight: '800' }, searchBox: { height: 54, borderRadius: 13, backgroundColor: colors.paper, flexDirection: 'row', alignItems: 'center', paddingLeft: 16, paddingRight: 6, marginBottom: 17, borderWidth: 1, borderColor: colors.line }, searchInput: { flex: 1, marginLeft: 10, color: colors.ink, fontSize: 14 }, filterButton: { width: 42, height: 42, borderRadius: 10, backgroundColor: colors.deepSage, alignItems: 'center', justifyContent: 'center' }, categoryRow: { gap: 9, paddingBottom: 28 }, categoryChip: { paddingHorizontal: 17, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper }, categoryChipActive: { backgroundColor: colors.deepSage, borderColor: colors.deepSage }, categoryText: { color: colors.muted, fontWeight: '600', fontSize: 13 }, categoryTextActive: { color: colors.paper }, sectionHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }, sectionTitle: { fontSize: 19, fontWeight: '700', color: colors.ink }, linkText: { color: colors.deepSage, fontSize: 13, fontWeight: '700' }, propertyCard: { marginBottom: 24 }, propertyImage: { width: '100%', height: 205, borderRadius: 17, backgroundColor: colors.paleSage }, imageBadge: { position: 'absolute', left: 11, bottom: 11, backgroundColor: colors.paper, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 6 }, imageBadgeText: { color: colors.deepSage, fontWeight: '800', fontSize: 12 }, heart: { position: 'absolute', right: 11, top: 11, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(22,33,30,0.35)', alignItems: 'center', justifyContent: 'center' }, propertyInfo: { paddingTop: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, propertyName: { color: colors.ink, fontSize: 16, fontWeight: '700' }, propertyLocation: { color: colors.muted, fontSize: 13, marginTop: 5 }, price: { color: colors.ink, fontSize: 14, fontWeight: '800' }, perNight: { color: colors.muted, fontSize: 11, fontWeight: '400' }, emptyText: { color: colors.muted, textAlign: 'center', marginTop: 40 },
  detailScreen: { flex: 1, backgroundColor: colors.cream }, detailContent: { paddingBottom: 105 }, detailImage: { width: '100%', height: 330, backgroundColor: colors.paleSage }, backButton: { position: 'absolute', left: 20, top: 55, width: 40, height: 40, borderRadius: 20, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' }, detailHeart: { position: 'absolute', right: 20, top: 55, width: 40, height: 40, borderRadius: 20, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' }, detailBody: { padding: 24 }, detailTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }, detailName: { color: colors.ink, fontSize: 24, fontWeight: '700', letterSpacing: -0.4 }, detailLocation: { color: colors.muted, fontSize: 14, marginTop: 6 }, ratingBlock: { flexDirection: 'row', gap: 5, alignItems: 'center', backgroundColor: '#FCEBE7', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 9 }, ratingText: { color: colors.ink, fontWeight: '800', fontSize: 13 }, tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 21 }, tag: { borderRadius: 20, backgroundColor: colors.paleSage, paddingHorizontal: 11, paddingVertical: 8 }, tagText: { color: colors.deepSage, fontSize: 12, fontWeight: '700' }, rule: { height: 1, backgroundColor: colors.line, marginVertical: 23 }, detailDescription: { color: colors.ink, fontSize: 15, lineHeight: 24 }, hostRow: { flexDirection: 'row', alignItems: 'center', marginTop: 25, gap: 12 }, hostAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.sage, alignItems: 'center', justifyContent: 'center' }, hostAvatarText: { color: colors.deepSage, fontWeight: '800', fontSize: 12 }, hostTitle: { color: colors.ink, fontWeight: '700', fontSize: 13 }, hostMeta: { color: colors.muted, fontSize: 12, marginTop: 4 }, bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: colors.paper, borderTopWidth: 1, borderTopColor: colors.line, paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, bottomPrice: { color: colors.ink, fontWeight: '800', fontSize: 16 }, bottomMeta: { color: colors.deepSage, fontSize: 11, marginTop: 4 }, reserveButton: { backgroundColor: colors.deepSage, borderRadius: 11, paddingHorizontal: 19, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 9 }, reserveText: { color: colors.paper, fontWeight: '800', fontSize: 14 },
  tabBar: { height: 78, backgroundColor: colors.paper, borderTopWidth: 1, borderTopColor: colors.line, flexDirection: 'row', justifyContent: 'space-around', paddingTop: 11 }, tab: { alignItems: 'center', width: 90, gap: 5 }, tabLabel: { fontSize: 11, color: colors.muted, fontWeight: '600' }, tabLabelActive: { color: colors.deepSage, fontWeight: '800' },
  bookingContent: { padding: 24, paddingBottom: 35 }, bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 }, roundButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line }, bookingTitle: { color: colors.ink, fontSize: 18, fontWeight: '700' }, bookingImage: { width: '100%', height: 190, borderRadius: 16, marginBottom: 17 }, formLabel: { fontSize: 11, color: colors.muted, fontWeight: '800', letterSpacing: 1.5, marginBottom: 9 }, formRow: { minHeight: 65, backgroundColor: colors.paper, borderRadius: 13, marginBottom: 22, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.line }, formIcon: { width: 38, height: 38, backgroundColor: colors.paleSage, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }, formValue: { color: colors.ink, fontWeight: '700', fontSize: 14 }, formHint: { color: colors.muted, fontSize: 11, marginTop: 4 }, guestCopy: { flex: 1 }, stepper: { width: 27, height: 27, borderRadius: 14, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }, stepText: { color: colors.deepSage, fontSize: 19, lineHeight: 21 }, guestCount: { color: colors.ink, fontWeight: '700', fontSize: 14 }, priceSummary: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4, marginBottom: 25 }, summaryRight: { alignItems: 'flex-end' }, summaryText: { color: colors.muted, fontSize: 13, lineHeight: 26 }, totalLabel: { color: colors.ink, fontWeight: '800', fontSize: 15, marginTop: 8 }, totalValue: { color: colors.ink, fontWeight: '800', fontSize: 16, marginTop: 8 },
  bookingCard: { backgroundColor: colors.paper, borderRadius: 16, padding: 12, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.line }, bookingThumb: { width: 88, height: 105, borderRadius: 11 }, bookingCardInfo: { flex: 1 }, bookingStatus: { alignSelf: 'flex-start', backgroundColor: colors.paleSage, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 4, marginBottom: 7 }, bookingStatusText: { color: colors.deepSage, fontSize: 10, fontWeight: '800' }, bookingCardName: { color: colors.ink, fontSize: 15, fontWeight: '700' }, bookingCardMeta: { color: colors.muted, fontSize: 12, marginTop: 6 }, bookingPrice: { color: colors.ink, fontSize: 13, fontWeight: '800', marginTop: 10 }, emptyState: { alignItems: 'center', marginTop: 100, paddingHorizontal: 25 }, emptyIcon: { backgroundColor: colors.paleSage, width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }, emptyTitle: { color: colors.ink, fontSize: 19, fontWeight: '700', marginTop: 18 }, emptyCopy: { color: colors.muted, textAlign: 'center', lineHeight: 21, marginTop: 8 },
  profileHero: { alignItems: 'center', paddingTop: 12, paddingBottom: 28 }, profileAvatar: { width: 82, height: 82, borderRadius: 41, backgroundColor: colors.coral, alignItems: 'center', justifyContent: 'center' }, profileAvatarText: { color: colors.paper, fontSize: 25, fontWeight: '800' }, profileName: { color: colors.ink, fontSize: 20, fontWeight: '700', marginTop: 14 }, profileEmail: { color: colors.muted, fontSize: 13, marginTop: 5 }, editButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.paleSage, borderRadius: 18, paddingHorizontal: 13, paddingVertical: 8, marginTop: 14 }, editText: { color: colors.deepSage, fontSize: 12, fontWeight: '700' }, profileMenu: { backgroundColor: colors.paper, borderRadius: 17, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.line }, menuRow: { minHeight: 63, flexDirection: 'row', alignItems: 'center', gap: 12 }, menuIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.paleSage, alignItems: 'center', justifyContent: 'center' }, menuText: { color: colors.ink, fontSize: 14, fontWeight: '600', flex: 1 }, version: { color: colors.muted, fontSize: 10, letterSpacing: 1.2, textAlign: 'center', marginTop: 30 },
});
