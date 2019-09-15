run-android-debug:
	react-native run-android

run-android-release:
	react-native run-android --variant=release

create-keystore:
	keytool -genkeypair -v -keystore patxanga.keystore -storepass patxanga -alias patxanga -keyalg RSA -keysize 2048 -validity 10000
	mv patxanga.keystore android/app
