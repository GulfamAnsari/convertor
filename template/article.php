<article class="col-sm-8">
  <!--article title and views-->
  <?php
  include($_SERVER['DOCUMENT_ROOT'] . '/articleDetails.php');
  // article navigation panel
  getCatagoryNavigationDetails();
  ?>
  <!-- Article start -->
  <div class="post-single clearfix">
    <h1></h1>
    <?php
    getArticleDetails();
    include($_SERVER['DOCUMENT_ROOT'] . '/commentCount.php');
    ?>
    <!-- Article body -->
    <img class="size-medium wp-image-1402 aligncenter" src="https://droidtechknow.000webhostapp.com/wp-content/uploads/2019/08/Gallery-300x200.jpg" alt="" width="300" height="200" />
    Memories are captured, they are saved and shared across various platforms. But how do we manage them? How do we see them without any technical or problematic error?

    <h2>Google Photos App</h2>
    Google Photos App is nowadays the default gallery application.
    <ul>
      <li>It's free</li>
    </ul>
    <ol>
      <li>It's free</li>
    </ol>
    <img class="alignnone size-medium wp-image-1437" src="https://droidtechknow.000webhostapp.com/wp-content/uploads/2019/08/google-photos-5-169x300.png" alt="" width="169" height="300" />
    Download: <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.photos&amp;hl=en_IN">https://play.google.com/store/apps/details?id=com.google.android.apps.photos&amp;hl=en_IN</a>
    &nbsp;

    <!-- article body end -->

  </div><!-- .post-single -->

  <!-- end article -->

  <!--share-->
  <?php include($_SERVER['DOCUMENT_ROOT'] . '/share.php'); ?>
  <!--End share-->

  <!--Discuss forum-->
  <div id="disqus_thread"></div>
  <?php include($_SERVER['DOCUMENT_ROOT'] . '/discuss.php'); ?>
  <!--end discuss forum-->
</article>