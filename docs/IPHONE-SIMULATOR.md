# iPhone Simulator on this Mac

Detected Apple Silicon, macOS 14.3.1, no Xcode installation. Apple's compatibility table lists Xcode 15.2 as compatible with this OS and iOS 17.2 Simulator. A current App Store Xcode may require a newer macOS.

1. Open https://developer.apple.com/download/all/?q=Xcode%2015.2 and sign in with your Apple account.
2. Download **Xcode 15.2**. Open the .xip archive, then move Xcode.app into Applications.
3. Open Xcode, complete its first-launch setup, and install the iOS simulator component. If absent, use Xcode → Settings → Platforms to install iOS 17.2.
4. Open `MUHUR-iPhone.command` in Finder from the project directory. It starts the local Expo server and requests opening the app through Expo Go in the iPhone Simulator. Keep its terminal window open.

The launcher was syntax-checked. Actual Simulator launch and Expo Go compatibility must be verified after Xcode and the simulator runtime are installed. No native build, App Store publishing, or paid developer membership is configured by this script.
