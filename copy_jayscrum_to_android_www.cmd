xcopy JayScrum\Images JayScrum_Android\assets\www\Images\ /S /Y
xcopy JayScrum\Properties JayScrum_Android\assets\www\Properties\ /S /Y
xcopy JayScrum\Scripts JayScrum_Android\assets\www\Scripts\ /S /Y
xcopy JayScrum\Styles JayScrum_Android\assets\www\Styles\ /S /Y
copy JayScrum\index.html JayScrum_Android\assets\www\ /Y
del JayScrum_Android\assets\www\Scripts\cordova-1.9.0ios.js