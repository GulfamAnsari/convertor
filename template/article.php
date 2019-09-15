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
    <!-- article body -->
    <div class="post-entry"></div>
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